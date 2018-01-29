 google.maps.Marker.prototype.setLabel = function(label){
     if(this.label) {
         if (label) {
             this.label.setText(label);
         } else {
             this.label.setMap(null);
             this.label = null;
         }
     } else if (label) {
        this.label = new PALM.MarkerLabel({
          map: this.map,
          marker: this,
          text: label
        });
        this.label.bindTo('position', this, 'position');
     }
};

google.maps.Marker.prototype.setMap = function() {
    var setMap = google.maps.Marker.prototype.setMap;
    return function(map){
        if (this.label) {
            this.label.setMap(map);
        }  
        setMap.apply(this, arguments);
    };
}();
    
 

PALM.MarkerLabel = function(options) {
    this.setValues(options);
    this.span = document.createElement('span');
    this.span.className = 'map-marker-label';
    PALM.MarkerLabel.spans.push(this.span);
};

PALM.MarkerLabel.spans = [];

PALM.MarkerLabel.prototype = Object.assign(new google.maps.OverlayView(), {
    onAdd: function() {
        this.getPanes().overlayImage.appendChild(this.span);
        this.listeners = [
            google.maps.event.addListener(this, 'position_changed', () => this.draw())
        ];
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
        this.span.classList.remove('map-marker-label-left','map-marker-label-right',
                                   'map-marker-label-top','map-marker-label-bottom',
                                   'map-marker-label-hidden');
        
        var text = String(this.get('text'));
        var position = this.getProjection().fromLatLngToDivPixel(this.get('position'));
        this.span.innerHTML = text;
        this.span.style.left = position.x + 'px';
        this.span.style.top = position.y + 'px';
        this.span.classList.add('map-marker-label-left');
        
        if (this.overlaps()) {
            this.span.classList.remove('map-marker-label-left');
            this.span.classList.add('map-marker-label-right');
            if (this.overlaps()) {
                this.span.classList.remove('map-marker-label-right');
                this.span.classList.add('map-marker-label-bottom');
                if (this.overlaps()) {
                    this.span.classList.remove('map-marker-label-bottom');
                    this.span.classList.add('map-marker-label-top');
                    if (this.overlaps()) {
                        this.span.classList.remove('map-marker-label-top');
                        this.span.classList.add('map-marker-label-hidden');
                    }
                }
            } 
        }
    },
    
    overlaps: function() {
        var b = this.span.getBoundingClientRect();
        var overlaps = PALM.MarkerLabel.spans.sort((a,b) => b.offsetLeft - a.offsetLeft).some((span) => {
            if (span != this.span) {
                var a = span.getBoundingClientRect();
                return ((a.left <= b.left && a.right >= b.left) || (a.right >= b.right && a.left <= b.right)) &&
                    ((a.top <= b.top && a.bottom >= b.bottom) || (a.bottom >= b.bottom && a.top <= b.bottom));
            }
            return false;
        });
        return overlaps;
    },
    
    onRemove: function() {
        this.unbindAll();
        if (this.span) {
            var spans = PALM.MarkerLabel.spans;
            var index = spans.indexOf(this.span);
            spans.splice(index, 1);
            
            this.span.parentNode.removeChild(this.span);
        }
    }
});