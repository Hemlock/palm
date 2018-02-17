css(`
.map-canvas {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
}

.map-options {
    bottom: 25px !important;
    left: 50px !important;
}

.map-list {
}

`);

PALM.Layout = {
    initialize: function(options) {
        Object.assign(this, options);
        this.listEl = document.querySelector('.map-list');
        this.optionsEl = document.querySelector('.map-options');
        this.map.controls[google.maps.ControlPosition.RIGHT_TOP]
            .push(this.listEl);
        this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM]
            .push(this.optionsEl);

        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();
    },

    onResize: function() {
        this.listEl.style.height = (this.map.getDiv().offsetHeight) + 'px'
    }
}