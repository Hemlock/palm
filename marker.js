PALM.Marker = function(options) {

    google.maps.Marker.call(this, options);
    this.title = this.name + ' ' + (this.rating ? this.rating + '\u2605s' : '')
    this.rating = this.rating || '';
    PALM.Marker.instances.push(this);
}
PALM.Marker.instances = [];

PALM.Marker.prototype = Object.assign(new google.maps.Marker, { 
    setLabel: function(label){
        if(this.label) {
            if (label) {
                this.label.setText(label);
            } else {
                this.label.setMap(null);
                this.label = null;
            }
        } else if (label) {
            this.label = new PALM.MarkerLabel({
                map: this.map,
                marker: this,
                text: label
            });
            this.label.bindTo('position', this, 'position');
        }
    },

    setMap: function(map) {
        google.maps.Marker.prototype.setMap.apply(this, arguments);
        if (this.label) {
            this.label.setMap(map);
        } 
        
        if (!map) {
            var instances = PALM.Marker.instances;
            var index = instances.indexOf(this);
            instances.splice(index, 1);
        }
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
                info.open(this.map);
            }
        });
    }
});