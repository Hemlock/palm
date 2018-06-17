PALM.Queue = function(options) {
    this.items = [];
    this.running = 0;
    this.limit = 1;
    this.delay = 250;
    this.timeout = null;

    Object.assign(this, options);
}

PALM.Queue.prototype = {
    add: function(callback) {
        this.items.push(callback);
        this.next();
    },

    reset: function() {
        this.running = 0;
        this.items = [];
        if (this.timeout) {
            clearTiomeout(this.timeout);
        }
    },

    next: function() {
        if (this.running >= this.limit) {
            return;
        }
        this.running++;
        let callback = this.items.pop();
        if (!callback) {
            this.done();
        } else {
            this.ttimeout= setTimeout(() => {
                this.timeout = null;
                callback(()=> {
                    this.running--;
                    this.next();
                }, ()=> {
                    this.running--;
                    this.add(callback);
                });
            }, this.delay);
        }
    }
};