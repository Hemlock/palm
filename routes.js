
PALM.Routes = {
    initialize: function(folder, callback, scope) {
        this.folder = folder;
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.setAttribute('src', folder + '/info.js');
        script.setAttribute('type', 'text/javascript');
        head.appendChild(script);
        script.addEventListener('load', ()=> {
            if (callback) {
                callback.call(scope);
            }
        });
    },

    current: null,
    load: function(index, onLoad, scope) {
        if (this.current) {
            this.current.destroy();
        }

        var day = PALM.RouteInfo.days[index];
        var file = this.folder + '/' + day[1];
        this.current = new PALM.Route(map, file, day[1], Date.addDays(PALM.RouteInfo.startDate, day[2] || index));
        this.current.load(onLoad, scope);
    }
}