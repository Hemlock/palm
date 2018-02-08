PALM.Places = function(map) {
    this.limit = 1;
    this.delay = 250;
    this.drawBoxes = false;
    this.timer = null;

    this.running = 0;
    this.places = new google.maps.places.PlacesService(map);
    this.info = new google.maps.InfoWindow({});
    this.queue = [];
    this.markers = {};
    this.rectangles = [];
    
    google.maps.event.addListener(map, 'bounds_changed', this.onBoundsChanged.bind(this));
    this.updateLabels();
};

PALM.Places.prototype = {
    getColor: function(types) {
        return '#ff000';
    },

    search: function(types, route) {
        this.clearMarkers();
        this.clearRectangles();
        
        var me = this;
        this.queue = [];
        this.fire('update');

        var boxes = PALM.Boxer.getBoxes(route, this.drawBoxes);
        boxes.sort(function(a,b){
            var ac = a.getCenter();
            var bc = b.getCenter();

            return ac.lng() - bc.lng() || ac.lat() - bc.lat();
        });

        var path = route.getPath();
        var i =0;
        while (i < 2) {
            types.forEach(function(type) {
                me.queue.push(new PALM.Search({
                    location: path[path.length-1],
                    radius: 3200, // ~2 miles
                    type_name: type.name,
                    keyword: i ? type.term : null,
                    type: type.term
                }));
            });
            
            boxes.forEach(function(box) {
                types.forEach(function(type) {
                    me.queue.push(new PALM.Search({
                        type_name: type.name,
                        bounds: box,
                        keyword: i ? type.term : null,
                        type: type.term
                    }));
                    me.next();
                });
                
                me.rectangles.push(new google.maps.Rectangle({
                    bounds: box,
                    strokeWeight: 0,
                    strokeColor: '#000000',
                    strokeOpacity: 0.6,
                    fillOpacity: 0.05,
                    map: map,
                    zIndex: -1
                }));
            });
            i++;
        }
    },

    next: function() {
        var me = this;
        if (!this.timer) {
            this.timer = setTimeout(function() {
                me.step();
                me.timer = null;
            }, this.delay);
        }
    },

    step: function() {
        while (this.running < this.limit && this.queue.length) {
            this.running++;
            this.doSearch(this.queue.pop());
        }
        this.fire('update');
    },

    doSearch: function(search) {
        var me = this;
        search.load();
        if (search.results) {
            search.results.forEach((result) => {
                var type = PALM.Types.byName[search.type_name];
                if (me.keepResult(result, type)) {
                    this.createMarker(type.icon, result);
                }
            });
            this.running--;
            me.step();
        } else {
            this.places.nearbySearch(search, function(results, status, pagination) {
                if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                    me.queue.push(search);
                    setTimeout(function() {
                        me.running--;
                        me.next();
                    }, me.delay)
                } else {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        search.save(results);
                        search.results.forEach((result) => {
                            var type = PALM.Types.byName[search.type_name];
                            if (me.keepResult(result, type)) {
                                me.createMarker(type.icon, result);
                            }
                        });
                    } else if (status== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        search.save([]);
                    }
                    me.running--;
                    me.next();
                }
            });
        }
    },

    keepResult: function(result, type) {
        var keep = false;
        if (type.keeps == null || type.keeps.length == 0) {
            keep = true;
        } else {
            keep = result.types.some((term) => ~type.keeps.indexOf(term))
        }

        keep = keep && (type.skips == null || !result.types.some((term)=> ~type.skips.indexOf(term)));
        return keep;
    },

    clearMarkers: function() {
        var id;
        for (id in this.markers) {
            var marker = this.markers[id];
            this.fire('markerremoved', id, marker);
            marker.setMap(null);
        }
        this.markers = {};
    },
    
    clearRectangles: function() {
        this.rectangles.forEach((rect)=> rect.setMap(null));
        this.rectangles = [];
    },

    createMarker: function(icon, place) {
        if (!this.markerExists(place)) {
            var marker = new PALM.Marker({
                position: place.geometry.location,
                icon: 'icons/' + icon + '-small.png',
                title: place.name + ' ' + (place.rating ? place.rating + '\u2605s' : '')
            });
            google.maps.event.addListener(marker, 'click', this.showInfo.bind(this, marker, place));
            marker.setMap(map);
            this.markers[place.placeId] = marker;
            this.fire('markeradded', place, marker);
        }
    },

    markerExists: function(place) {
        return !!this.markers[place.placeId];
    },
   
    onBoundsChanged: function() {
        this.updateLabels();
    },
    
    updateLabels: function() {
        var timer = null;
        return function() {
            if (timer) {
                clearTimeout(timer)
            }
            
            timer = setTimeout(() => {
                if (map.zoom >= 14) {
                    this.showMarkerLabels();
                } else {
                    this.hideMarkerLabels();
                }
            }, 20)
        }
    }(),
    
    showMarkerLabels: function() {
        var bounds = map.getBounds();
        for (var placeId in this.markers) {
            var marker = this.markers[placeId];
            if (bounds.contains(marker.position)) {
                this.showMarkerLabel(marker);
            } else {
                this.hideMarkerLabel(marker);
            }
        }
    },
    
    showMarkerLabel: function(marker) {
        marker.setLabel(marker.title);
    },
    
    hideMarkerLabels: function() {
        for (var placeId in this.markers) {
            this.hideMarkerLabel(this.markers[placeId]);
        }
    },
    
    hideMarkerLabel: function(marker) {
        marker.setLabel(null);    
    },

    showInfo: function(marker,place) {
        var info = this.info;
        this.places.getDetails({placeId: place.placeId}, function(placeDetails, status) {
            if (status == 'OK') {
                var content = ((placeDetails.rating == undefined ? '' : '<span class="place-rating">{rating}</span>') +
                    '<a class="place-name" target="_blank" href="{url}">{name}</a>' +
                    '<div class="reviews">').format(placeDetails);
                if (placeDetails.reviews) {
                    placeDetails.reviews.forEach(function(review) {
                        if (review.text) {
                            content += ('<div class="review-author">{author_name}</div>' +
                                '<div class="review-text">{text}</div>').format(review);
                        }
                    });
                }
                info.setContent(content + '</div>');
                info.setPosition(marker.getPosition());
                info.marker = marker;
                info.open(map);
            }
        });
    }

};

PALM.Places.mixin(Observable);
