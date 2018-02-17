
css(`
#distance-marker {
    position: absolute;
    bottom: 0;
    right: 0;
    display: none;
    z-index: 2;
    width: 18px;
    height: 18px;
    background-color: #999;
    color: white;
    font-size: 12px;
    border: 1px solid white;
    padding: 4px 3px 0 2px;
    text-align: center;
    border-radius: 18px;
    box-shadow: 0 0 10px #ddd;
}
`);

PALM.Routes = {
    initialize: function(options, callback, scope) {
        Object.assign(this, options);
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.setAttribute('src', this.folder + '/info.js');
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
        this.current = new PALM.Route(this.map, file, day[1], Date.addDays(PALM.RouteInfo.startDate, day[2] || index));
        this.current.load(onLoad, scope);
    }
}