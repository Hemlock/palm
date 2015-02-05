var Observable = {
    on: function(event, listener, scope) {
        if (!this.events) {
            this.events = {}
        }
        
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        this.events[event].push([listener, scope]);
    },
    
    fire: function(event) {
        var args = Array.toArray(arguments,1);
        if (this.events && this.events[event]) {
            var result = this.events[event].reduce(function(result, handler) {
                var listener = handler[0];
                var scope = handler[1];
                return listener.apply(scope, args) && result
            }, true);
            return result;
        }
        return null;
    }
}
