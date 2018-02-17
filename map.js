
css(`        
    .map-canvas {
    }
`);

PALM.Map = {
    initialize: function() {
        this.el = document.createElement('div');
        this.el.className = 'map-canvas';
        document.body.appendChild(this.el);

        this.map = new google.maps.Map(this.el, {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [{
                featureType: 'poi',
                stylers: [{visibility: 'off'}]
            }, {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{visibility: 'off'}]
            }],
            mapTypeControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP,
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            fullscreenControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
            }

        });
        var bikeLayer = new google.maps.BicyclingLayer();
        bikeLayer.setMap(this.map);

        return this.map;
    }
};