
PALM.Route = function(map, uri) {
    this.map = map;
    this.uri = uri;
    this.path = [];
    this.bounds = new google.maps.LatLngBounds();
    this.polyLine = null;

    var mouse = {
        top: 0,
        left: 0
    };

    document.body.addEventListener('mousemove', this.onMouseMove.bind(this), false);
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
        google.maps.event.addListener(polyLine, "mouseover", this.onMouseOver.bind(this));
        google.maps.event.addListener(polyLine, "mouseout", this.onMouseOut.bind(this));

        this.bounds = bounds;
        this.path = path;
        this.polyLine = polyLine;
    },
    onMouseMove: function(e) {
        var marker = this.getDistanceMarker();
        marker.style.top = (e.clientY - 30) + 'px';
        marker.style.left = e.clientX + 'px';
    },

    onMouseOver: function(e) {
        var latLng = e.latLng;
        var closest = this.path.concat().sort(function(a,b) {
            return this.roughDistanceBetween(latLng, a) - this.roughDistanceBetween(latLng, b);
        }.bind(this))[0];
        var index = this.path.indexOf(closest);
        var subPath = this.path.slice(0, index);
        var meters = google.maps.geometry.spherical.computeLength(subPath);
        var miles = meters * 0.000621371;
        this.showDistance(Math.round(miles));
    },

    onMouseOut: function() {
        this.hideDistance();
    },

    showDistance: function(miles) {
        var marker = this.getDistanceMarker();
        marker.innerHTML = miles;
        marker.style.display = 'block';
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
        return (Math.pow(latLngA.lat()  - latLngB.lat()), 2) + Math.pow(latLngA.lng() - latLngB.lng(), 2);
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
    }

}

PALM.Routes = {
//    days: [
//        "PALM_32_1st_Day.xml",
//        "PALM_32_2nd._Day.xml",
//        "PALM_32_3rd_Day_Lake_Odessa_to_Dansville.xml",
//        "PALM_32_4th_Day_Dansville_to_Manchester.xml",
//        "PALM_32_5th_Day_Manchester_to_Petersburg.xml",
//        "PALM_32_6th_Day_Petersburg_to_Luna_Pier.xml"
//    ],
    days: [
        "PALM_33_1st_Day_Holland_to_Wayland.xml",
        "PALM_33__2nd_Day_Wayland_to__Greenville.xml",
        "PALM_33_3rd_Day_Greenvillle_to_St_Johns.xml",
        "PALM_33_4th_Day_St_Johns_to_Flushing.xml",
        "PALM_33_5th_Day_Flushing_to_North_Branch.xml",
        "PALM_33_6th_Day_North_Branch_to_Lexington.xml"
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