
PALM.Route = function(map, uri, name, date) {
    this.name = name;
    this.map = map;
    this.uri = uri;
    this.path = [];
    this.bounds = new google.maps.LatLngBounds();
    this.polyLine = null;
    this.weather = new PALM.Weather(map, date);

    var mouse = {
        top: 0,
        left: 0
    };
    document.body.addEventListener('mousemove', this.onBodyMouseMove.bind(this), false);
    this.mouse = mouse;
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
        for (var i= 0, length=steps.length; i<length; i++) {
            var step = steps[i++];
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
        google.maps.event.addListener(polyLine, "mousemove", this.onRouteMouseMove.bind(this));
        google.maps.event.addListener(polyLine, "mouseout", this.onMouseOut.bind(this));

        this.bounds = bounds;
        this.path = path;
        this.polyLine = polyLine;
        

        var date = new Date();
        this.weather.forecast(this.path[0]);
        this.weather.forecast(this.path[this.path.length-1]);
    },
    
    onBodyMouseMove: function(e) {
        var marker = this.getDistanceMarker();
        marker.style.top = (e.clientY - 30) + 'px';
        marker.style.left = e.clientX + 'px';
    },
    
    onRouteMouseMove: function(e) {    
        this.showDistanceTo(e.latLng);
    },

    onMouseOut: function() {
        this.hideDistance();
    },
    
    showDistanceTo: function(latLng) {
        var closest = this.path.concat().sort(function(a,b) {
            return this.roughDistanceBetween(latLng, a) - this.roughDistanceBetween(latLng, b);
        }.bind(this))[0];
        
        var index = this.path.indexOf(closest);
        var subPath = this.path.slice(0, index);
        var meters = google.maps.geometry.spherical.computeLength(subPath);
        var miles = Math.round(meters * 0.000621371);
        return this.showDistance(miles);
    },

    showDistance: function(miles) {
        var marker = this.getDistanceMarker();
        marker.innerHTML = miles;
        marker.style.display = 'block';
        return marker;
    },

    hideDistance: function() {
        this.getDistanceMarker().style.display = 'none';
    },

    getDistanceMarker: function() {
        if (!this.distanceMarker) {
            this.distanceMarker = document.getElementById('distance-marker')
        }
        return this.distanceMarker;
    },

    roughDistanceBetween: function(latLngA, latLngB) {
        return Math.pow(latLngA.lat()  - latLngB.lat(), 2) + Math.pow(latLngA.lng() - latLngB.lng(), 2);
    },

    distanceBetween: function(latLngA, latLngB) {
        return google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB);
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
        this.weather.destroy();
    }

}

PALM.Routes = {
    folder: 'ADK-2016',
    startDate: new Date(Date.parse('2016-08-21 EDT')),
    days: [
        ['Sunday','CA2016_Day_1.xml'],
        ['Monday','CA2016_Day_2.xml'],
        ['Tuesday','CA2016_Day_3.xml'],
        ['Wednesday','CA2016_Day_4_Layover.xml'],
        ['Thursday','CA2016_Day_5.xml'],
        ['Friday','CA2016_Day_6_Long_Option.xml', 5],
        ['Friday (short)','CA2016_Day_6_Short_Route.xml', 5],
        ['Saturday','CA2016_Day_6_Long_Option.xml', 6],
        ['Saturday (short)','CA2016_Day_7_Short_Option.xml', 6]
    ],
    current: null,
    load: function(map, index, onLoad, scope) {
        if (this.current) {
            this.current.destroy();
        }

        var day = this.days[index];
        var file = this.folder + '/' + day[1];
        this.current = new PALM.Route(map, file, day[1], Date.addDays(this.startDate, day[2] || index));
        this.current.load(onLoad, scope);
    }
}
