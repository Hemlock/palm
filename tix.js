PALM.tix = function() {
    this.maps = [];
}

PALM.tix.prototype = {
    addMap: function() {
        var el = document.createElement('div');
        var map = new google.maps.Map(el, {
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });

    }
}