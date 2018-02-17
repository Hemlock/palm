css(`
.map-list {
    box-shadow: 0 0 3px #aaa;
    background-color: white;
    width: 300px;
    transition: transform .2s;
}

.map-list.collapsed {
    transform: translate(280px, 0);
}

.map-list-header {
    height: 100%;
    width: 18px;
    border-right: 1px solid #ddd;
    cursor: pointer;
    background-color: #eee;
}

.map-list-header div {
    padding: 3px 3px 3px 18px;
    transform: rotate(90deg);
    transform-origin: 9px 9px;
    background-image: url('icons/up.png');
    background-repeat: no-repeat;
    background-position-x: 2px;
    white-space: nowrap;
}

.map-list.collapsed .map-list-header div {
    background-image: url('icons/down.png');
}

.map-list-header:hover {
    background-color: #ddd;
}

.map-list-table {
    position: absolute;
    top: 0;
    left: 0;
    padding-left: 18px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}

.map-list-table-body {
    overflow: auto;
    height: 100%;
    width: 100%;
}

.map-list-row {
    display: table-row; 
    width: 100%;
}

.map-list-row * {
    display: table-cell;
    vertical-align: middle;
    border-bottom: 1px solid #ddd;
}

.map-list-row span {
    padding: 3px;
}

.map-list-row :nth-child(1) {
    padding: 0;
    width: 21px;
}
.map-list-row :nth-child(2) {
    text-align: center;
    width: 15px;
}
.map-list-row :nth-child(3) {
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
}

`);

PALM.List = function() {
    var $this = function(options) {
        this.updateTimer = null;
        Object.assign(this, options);
        this.el = html(`
            <div class="map-list">
                <div class="map-list-table"></div>
                <div class="map-list-header">
                    <div>Places</div>
                </div>
            </div>`
        );
        this.markers = [];
        this.header = this.el.querySelector('.map-list-header')
        this.header.addEventListener('click', this.onHeaderClick.bind(this));
        this.list = this.el.querySelector('.map-list-table');
        this.places.on('markeradded', this.onMarkerAdded, this);
        this.places.on('markerremoved', this.onMarkerRemoved, this);

        this.list.addEventListener('mouseover', this.onMouseOver.bind(this));
        this.list.addEventListener('mouseout', this.onMouseOut.bind(this));

        google.maps.event.addListener(this.map, 'bounds_changed', this.onBoundsChanged.bind(this));
    }

    Object.assign($this.prototype, {
        onMouseOver: function(e) {
            var marker = this.getMarkerForEvent(e);
            if (marker) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        },

        onMouseOut: function(e) {
            var marker = this.getMarkerForEvent(e);
            if (marker) {
                marker.setAnimation(null);
            }
        },

        getMarkerForEvent: function(e) {
            var node = e.target;
            while (!node.matches('.map-list-row')) {
                node = node.parentNode;
                if (!node || node == this.el) {
                    return null;
                }
            }
            var index = parseInt(node.getAttribute('index'), 10);
            return this.markers[index]
        },

        getSortFunction: function() {
            return (a,b) => (b.rating || 0) - (a.rating || 0);
        },

        onHeaderClick: function() {
            this.el.classList.toggle('collapsed');
        },

        onMarkerAdded: function(place, marker) {
            this.addedTimer = null;
            this.markers.push(marker);
            this.update();
        },

        onMarkerRemoved: function(place, marker) {
            var index = this.markers.indexOf(marker);
            if (~index) {
                this.markers.splice(index, 1);
            }
            this.update();
        },

        onBoundsChanged: function() {
            this.update();
        },

        update: function() {
            if (this.updateTimer) {
                clearTimeout(this.updateTimer);
            }

            this.updateTimer = setTimeout(() => {
                var bounds = this.map.getBounds();
                var markers = this.markers.filter((marker) => {
                    return bounds.contains(marker.getPosition());
                });
                markers.sort(this.getSortFunction())
                
                this.updateTimer = null;
                var html = markers.map((marker) => {
                    var index = this.markers.indexOf(marker);
                    return `<div class="map-list-row" index="${index}">
                        <img src="${marker.icon}" />
                        <span>${marker.rating}</span>
                        <span>${marker.name}</span>
                    </div>`;
                }).join('');

                this.list.innerHTML = `<div class="map-list-table-body">
                    ${html}
                </div>`;
            }, 500);
        }
    });

    return $this;
}();

