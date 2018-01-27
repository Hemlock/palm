PALM.Place = function(def) {
    if (def instanceof Array) {
        this.deserialize(def);
    } else {
        this.placeId = def.place_id || def.placeId;
        this.name = def.name;
        this.rating = def.rating;
        this.types = def.types;
        this.geometry = {};
        this.geometry.location = def.geometry.location;
    }
};

PALM.Place.prototype = {

    deserialize: function(values) {
        this.placeId = values[0];
        this.name = values[1];
        this.rating = values[2];
        this.types = values[3];
        this.geometry = {
            location: {
                lat: values[4],
                lng: values[5]
            }
        }
    },
    
    serialize: function() {
        var loc = this.geometry.location;
        return [
            this.placeId,
            this.name,
            this.rating,
            this.types,
            typeof loc.lat == 'function' ? loc.lat() : lof.lat,
            typeof loc.lng == 'function' ? loc.lng() : loc.lng
        ]
    }
};