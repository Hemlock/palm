PALM.Search = function(def) {
    this.results = null;
    Object.assign(this, def);
}

PALM.Search.prototype = {
    getKey: function() {
        var base = '{type}/{keyword}/'.format(this);
        if (this.location) {
            return base + '{lat}/{lng}/'.format(this.location.toJSON()) + this.radius;
        } else {
            return base + '{south}/{west}/{north}/{east}'.format(this.bounds.toJSON());
        }
    },
    
    load: function() {
        this.results = null;
        var saved = PALM.Storage.get(this.getKey(), null);
        if (saved) {
            this.results = saved.map((s) => new PALM.Place(s));
        }
        return null;
    },
    
    save: function(results) {
        this.results = results.map((result) => new PALM.Place(result));
        PALM.Storage.set(this.getKey(), this.results.map((place) => place.serialize()));
    }
}