PALM.Places = function(map) {
    this.limit = 1;
    this.delay = 500;
    this.drawBoxes = false;
    this.timer = null;

    this.running = 0;
    this.places = new google.maps.places.PlacesService(map);
    this.info = new google.maps.InfoWindow({});
    this.queue = [];
    this.markers = {};

};
PALM.Places.STAR = "M -0.2,-1.9 0.2,-0.7 1.5,-0.7 0.5,0.1 0.9,1.3 -0.2,0.6 -1.3,1.3 -0.9,0.1 -1.9,-0.7 -0.6,-0.7";
PALM.Places.prototype = {
    
    getColor: function(types) {
        return '#ff000';
    },

    search: function(types, route) {
        this.clearMarkers();
        var me = this;
        this.queue = [];
        this.fire('update');
        var boxes = PALM.Boxer.getBoxes(route, this.drawBoxes);

        boxes.sort(function(a,b){
            var ac = a.getCenter();
            var bc = b.getCenter();
            
            return bc.lng() - ac.lng() || ac.lat() - bc.lat();
        });
        
        boxes.forEach(function(box) {
            types.forEach(function(typeGroup) {
                me.queue.push({
                    bounds: box,
                    types: typeGroup.split(',')
                });
                me.next();
            });
        });
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
        var boxOptions = {
          bounds: search.bounds,
          fillOpacity: .2,
          fillColor: '#009900',
          strokeOpacity: 1,
          strokeColor: '#009900',
          strokeWeight: 1,
          map: map
        }
        var box = new google.maps.Rectangle(boxOptions);
        
        var me = this;
        this.places.nearbySearch(search, function(results, status, pagination) {
            setTimeout(function() {
                box.setMap(null);
            }, me.delay);
            
            if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                boxOptions.fillColor = '#ff0000';
                boxOptions.strokeColor = '#ff0000';
                box.setOptions(boxOptions);
                
                me.queue.push(search);
                setTimeout(function() {
                    me.running--;
                    me.next();
                }, me.delay)
            } else {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    results.forEach(function(result) {
                        me.createMarker(me.getColor(result.types), result);
                    });
                }
                me.running--;
                me.next();
            }
        });

    },

    clearMarkers: function() {
        var id;
        for (id in this.markers) {
            this.markers[id].setMap(null);
        }
        this.markers = {};
    },

    createMarker: function(color, place) {
        if (!this.markerExists(place)) {
            var symbol = {
                path: this.isStarred(place.id) ? PALM.Places.STAR : google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity:.5,
                strokeColor: color,
                strokeWeight: 1,
                scale: 5
            };

            var marker = new google.maps.Marker({
                position: place.geometry.location,
                flat: true,
                icon: symbol,
                title: place.name + ' ' + (place.rating || '{not rated}')
            });

            google.maps.event.addListener(marker, 'dblclick', this.onMarkerDblClick.bind(this, marker, place));
            google.maps.event.addListener(marker, 'click', this.showInfo.bind(this, marker, place));

            marker.setMap(map);
            this.markers[place.id] = marker;
        }
    },

    markerExists: function(place) {
        var id = place.id;
        return !!this.markers[place.id];
    },

    onMarkerDblClick: function(marker, place) {
        var placeId = place.id;
        var starred = this.setStarred(placeId, !this.isStarred(placeId));

        var icon = marker.getIcon();
        icon.path = starred ? PALM.Places.STAR : google.maps.SymbolPath.CIRCLE;
        marker.setIcon(icon);
    },

    setStarred: function(id, starred) {
        window.localStorage.setItem(id, starred ? 1 : 0);
        return starred;
    },

    isStarred: function(id) {
        return !!+window.localStorage.getItem(id);
    },

    showInfo: function(marker,place) {
        var info = this.info;
        this.places.getDetails(place, function(placeDetails, status) {
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
                info.open(map);
            }
        });
    }
};

PALM.Places.mixin(Observable);





