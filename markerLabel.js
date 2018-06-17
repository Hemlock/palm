css(`
.map-marker-label {
    position: absolute;
    color: white;
    background-color: rgba(100,100,100,0.5);
    padding: 2px;
    display: inline-block;
    width: 100px;
    border-radius: 3px;
}

.map-marker-label-left {
    transform: translate(10px, calc(-50% - 17px))
}

.map-marker-label-right {
    text-align: right;
    transform: translate(calc(-100% - 10px), calc(-50% - 17px));
}

.map-marker-label-top {
    text-align: center;
    transform: translate(-50%, calc(-100% - 27px));
}

.map-marker-label-bottom {
    text-align: center;
    transform: translate(-50%, 1px);
}

.map-marker-label-hidden {
    display: none;
}

`)

PALM.MarkerLabel = function(options) {
    this.timer = null;
    this.setValues(options);
    this.span = document.createElement('span');
    this.span.className = 'map-marker-label map-marker-label-hidden';
    PALM.MarkerLabel.instances.push(this);

};

PALM.MarkerLabel.instances = [];

PALM.MarkerLabel.prototype = Object.assign(new google.maps.OverlayView(), {
    onAdd: function() {
        this.getPanes().overlayImage.appendChild(this.span);
    },

    setText: function(text) {
        if (String(this.get('text')) != String(text)) {
            this.set('text', text);
            if (this.span) {
                this.span.innerHTML = text;
            }
        }
    },
    
    draw: function() {
        this.boundsChanged = false;
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(()=> {
            this.timer = null;
            var text = String(this.get('text'));
            var projection = this.getProjection();
            if (projection) {
                var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
                this.span.innerHTML = text;
                this.span.style.left = position.x + 'px';
                this.span.style.top = position.y + 'px';
                this.span.className = 'map-marker-label map-marker-label-left';
                var bounds = this.map.getBounds();
                var boxes = PALM.Marker.instances.reduce((memo, marker) => {
                    if (marker != this.marker && bounds.contains(marker.getPosition())) {
                        memo.push(this.getMarkerBox(marker));
                    }
                    return memo;
                }, []);

                boxes = PALM.MarkerLabel.instances
                    .sort((a,b) => b.offsetLeft - a.offsetLeft)
                    .reduce((memo, label) => {
                    if (label !== this) {
                        memo.push(label.getBox());
                    } 
                    return memo;
                    }, boxes);

                if (this.overlaps(boxes)) {
                    this.span.classList.remove('map-marker-label-left');
                    this.span.classList.add('map-marker-label-right');
                    if (this.overlaps(boxes)) {
                        this.span.classList.remove('map-marker-label-right');
                        this.span.classList.add('map-marker-label-bottom');
                    //     if (this.overlaps(boxes)) {
                    //         this.span.classList.remove('map-marker-label-bottom');
                    //         this.span.classList.add('map-marker-label-top');
                            if (this.overlaps(boxes)) {
                                this.span.classList.remove('map-marker-label-top');
                                this.span.classList.add('map-marker-label-hidden');
                            }
                        }
                    // } 
                }
            } else {
                console.log(text);
            }
        }, 50);
    },
    
    overlaps: function(boxes) {
        var b = this.getBox();
        return boxes.some((a) => {
            return !(
                ((a.y + a.height) < (b.y)) ||
                (a.y > (b.y + b.height)) ||
                ((a.x + a.width) < b.x) ||
                (a.x > (b.x + b.width))
            );
        });
    },

    getBox: function(recalc) {
        return this.span.getBoundingClientRect();
    },

    getMarkerBox: function() {
        var span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.position = 'absolute';
        span.style.height = '28px';
        span.style.width = '21px';
        span.backgroundColor = 'black';
        span.style.transform = 'translate(-50%, -100%)';

        return function(marker) {
            if (!span.parentNode) {
                this.getPanes().overlayImage.appendChild(span);
            }
            var pos = this.getProjection().fromLatLngToDivPixel(marker.getPosition());
            span.style.top = pos.y + 'px';
            span.style.left = pos.x + 'px';
            return span.getBoundingClientRect();
        }
    }(),
    
    onRemove: function() {
        this.unbindAll();
        var instances = PALM.MarkerLabel.instances;
        var index = instances.indexOf(this);
        instances.splice(index, 1);
        
        if (this.span) {
            this.span.parentNode.removeChild(this.span);
        }
    }
});