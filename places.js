PALM.Places = function(map) {
    this.limit = 3;
    this.delay = 500;
    this.drawBoxes = false;
    this.timer = null;

    this.running = 0;
    this.places = new google.maps.places.PlacesService(map);
    this.info = new google.maps.InfoWindow({});
    this.queue = [];
    this.markers = [];

};

PALM.Places.prototype = {
    getColor: function(types) {
        console.log(types)
        return '#ff000';
    },

    search: function(types, route) {
        this.clearMarkers();
        var me = this;
        PALM.Boxer.getBoxes(route, this.drawBoxes).forEach(function(box) {
            me.queue.push({
                bounds: box,
                types: types
            });
            me.next();
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
            var me = this;
            var search = this.queue.pop();
            this.places.nearbySearch(search, function(results, status, pagination) {
                if (status == google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
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
        }
    },

    clearMarkers: function() {
        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers = [];
    },

    createMarker: function(color, place) {
        if (!this.markerExists(place)) {
            var symbol = {
                path: google.maps.SymbolPath.CIRCLE,
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
                place: place,
                title: place.name + ' ' + (place.rating || '{not rated}')
            });
            google.maps.event.addListener(marker, 'click', this.showInfo.bind(this, marker));
            marker.setMap(map);
            this.markers.push(marker);
        }
    },

    markerExists: function(place) {
        var id = place.id;
        return this.markers.some(function(marker) {
            return marker.place.id == id;
        });
    },

    showInfo: function(marker) {
        var place = marker.place;
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





