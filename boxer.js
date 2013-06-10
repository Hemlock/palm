PALM.Boxer = (function() {
    var ERROR = 0.0;
    var DISTANCE = 1;
    var routeBoxer = new RouteBoxer();

    function area(bounds) {
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var nw = new google.maps.LatLng(ne.lat(), sw.lng());

        var width = google.maps.geometry.spherical.computeDistanceBetween(ne, nw);
        var height = google.maps.geometry.spherical.computeDistanceBetween(sw, nw);

        return height * width;
    }

    return {
        rects: null,
        getBoxes: function(route, draw) {
            var me = this;
            this.clearBoxes();

            var path = route.getPath();
            var boxes = routeBoxer.box(path,DISTANCE);
            var index = 0;
            do {
                var box = boxes[index];
                var i = boxes.length;
                while (i--) {
                    var test = boxes[i];
                    if (i != index && box.intersects(test)) {
                        var union = new google.maps.LatLngBounds(box.getSouthWest(), box.getNorthEast());
                        union.union(boxes[i]);

                        if (area(box) + area(boxes[i]) >= (area(union) * (1-ERROR))) {
                            boxes.splice(i,1);
                            boxes.splice(index, 1);
                            boxes.push(union);
                            index = -1;
                            break;
                        }
                    }
                }
            } while (++index < boxes.length);

            if (draw) {
                this.drawBoxes(route.getMap(), boxes);
            }

            return boxes;
        },

        drawBox: function(map, box, color) {
            return new google.maps.Rectangle({
              bounds: box,
              fillOpacity: 0,
              strokeOpacity: 1,
              strokeColor: color || '#000099',
              strokeWeight: 1,
              map: map
            });
        },

        drawBoxes: function(map, boxes, color) {
            var me = this;
            this.rects = boxes.map(function(box) {
                return me.drawBox(map, box, color);
            });
        },

        clearBox: function(rect) {
            rect.setMap(null);
        },

        clearBoxes: function() {
            if (this.rects) {
                this.rects.forEach(this.clearBox.bind(this));
                this.rects = null;
            }
        }


};
})();