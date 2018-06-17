css(`
.place-name {
    font-size: 14px;
    font-weight: bold;
}

.place-rating {
    font-size: 14px;
    float: right;
}

.place-rating:after {
    content: " \\2605"
}

.reviews {
    font-size: 12px;
    max-height: 200px;
    width: 400px;
    overflow: auto;
}

.review-author {
    font-weight: bold;
}

.review-text {
    margin-bottom: 5px;
    padding-left: 19px;
}
`);

PALM.Places = function(options) {
    Object.assign(this, options);

    this.limit = 1;
    this.delay = 250;
    this.drawBoxes = false;
    this.timer = null;

    this.running = 0;
    this.places = new google.maps.places.PlacesService(this.map);
    this.info = new google.maps.InfoWindow({});
    this.queue = [];
    this.markers = {};
    this.details = {};
    this.rectangles = [];
    google.maps.event.addListener(this.map, 'bounds_changed', this.onBoundsChanged.bind(this));
    this.updateLabels();
};

PALM.Places.prototype = {
    getColor: function(types) {
        return '#ff000';
    },

    getPlaceDetailsForMarker: function(marker, callback) {
        let details = this.details[marker.placeId];
        if (details) {
            callback(details);
        } else {
            this.places.getDetails({ 
                placeId: marker.placeId
            }, (details, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    this.details[marker.placeId] = details;
                    callback(details);
                }
            });
        }
    },

    getPlaceForMarker: function(marker) {
        return this.results[marker.placeId];
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
                    map: this.map,
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
        this.results = {};
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
                name: place.name,
                rating: place.rating,
                placeId: place.placeId
            });
            marker.setMap(this.map);
            this.results[place.placeId] = place;
            this.markers[place.placeId] = marker;
            this.fire('markeradded', place, marker);
            google.maps.event.addListener(marker, 'click', this.showInfo.bind(this, marker, place));
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
                if (this.map.zoom >= 14) {
                    this.showMarkerLabels();
                } else {
                    this.hideMarkerLabels();
                }
            }, 20)
        }
    }(),
    
    showMarkerLabels: function() {
        var bounds = this.map.getBounds();
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
        this.getPlaceDetailsForMarker(marker, function(placeDetails) {
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

            var info = this.info;
            info.setContent(content + '</div>');
            info.setPosition(marker.getPosition());
            info.marker = marker;
            info.open(this.map);

        }.bind(this));
    }
};

PALM.Places.mixin(Observable);
