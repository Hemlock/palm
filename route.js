
PALM.Route = function(map, uri) {
    this.map = map;
    this.uri = uri;
    this.path = [];
    this.bounds = new google.maps.LatLngBounds();
    this.polyLine = null;
};

PALM.Route.prototype = {
    load: function(callback, scope) {
        var me = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.uri);
        xhr.addEventListener('load', function() {
            me.onRouteLoad(this.responseXML);
            if (callback) {
                callback.call(scope, me);
            }
        });
        xhr.send();

    },

    onRouteLoad: function(doc) {
        var bounds = new google.maps.LatLngBounds();
        var path = [];
        var map = this.map;

        var steps = doc.getElementsByTagName('trkpt');
        var i=steps.length;
        while (i--) {
            var step = steps[i];
            var latLng = new google.maps.LatLng(step.getAttribute('lat'), step.getAttribute('lon'));
            bounds.extend(latLng);
            path.push(latLng);

        }
        map.fitBounds(bounds);

        var polyLine = new google.maps.Polyline({
            path: path,
            strokeColor: "#0000ff",
            strokeOpacity: .7,
            strokeWeight: 4
        });

        polyLine.setMap(map);

        this.bounds = bounds;
        this.path = path;
        this.polyLine = polyLine;
    },

    getPath: function() {
        return this.path;
    },

    getBounds: function() {
        return this.bounds;
    },

    getMap: function() {
        return this.map;
    },

    destroy: function() {
        if (this.polyLine) {
            this.polyLine.setMap(null);
        }
    }

}

PALM.Routes = {
    days: [
        "PALM_32_1st_Day.xml",
        "PALM_32_2nd._Day.xml",
        "PALM_32_3rd_Day_Lake_Odessa_to_Dansville.xml",
        "PALM_32_4th_Day_Dansville_to_Manchester.xml",
        "PALM_32_5th_Day_Manchester_to_Petersburg.xml",
        "PALM_32_6th_Day_Petersburg_to_Luna_Pier.xml"
    ],
    current: null,
    load: function(map, day, onLoad, scope) {
        if (this.current) {
            this.current.destroy();
        }

        this.current = new PALM.Route(map, this.days[day]);
        this.current.load(onLoad, scope);
    }
}