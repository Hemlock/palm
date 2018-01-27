PALM.Storage = {
    get: function(key, def) {
        var saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : def;    
    },
    
    set: function(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    }
}