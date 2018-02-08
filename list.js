PALM.List = function() {
    var $this = function(options) {
        Object.assign(this, options);
        this.setMap(options.map);
        this.items = [];
    }

    $this.prototype = Object.assign(new google.maps.OverlayView(), {
        onAdd: function() {
            this.el = document.createElement('div');
            this.el.className = 'map-places-list';
            this.getPanes().overlayImage.appendChild(this.el);
            console.log(this.el);
        },

        draw: function() {
            places.on('markeradded', this.onMarkerAdded, this);
            places.on('markerremoved', this.onMarkerRemoved, this);
        },

        onMarkerAdded: function(place, marker) {
            this.items.push(place);
        },

        onMarkerRemoved: function(id, marker) {
            this.items = this.items.filter((place) => place.placeId != id);
        },

        onRemove: function() {
            var parent = this.el && this.el.parentNode;
            places.un('markeradded', this.onMarkerAdded, this);
            if (parent) {
                parent.removeChild(this.el);
            }
        }
    });
    return $this;
}();

