PALM.Weather = function(map, date) {
    this.apiKey = '3a3d7e0d4a9f4430a3100756162007';
    this.map = map;
    this.markers = [];
    this.date = date;
    this.info = new google.maps.InfoWindow({
        maxWidth: 700
    });
};

PALM.Weather.TIMES = [
    '12 am', '1 am', '2 am', '3 am', '4 am', '5 am', '6 am', '7 am', '8 am', '9 am', '10 am', '11 am',
    '12 pm', '1 pm', '2 pm', '3 pm', '4 pm', '5 pm', '6 pm', '7 pm', '8 pm', '9 pm', '10 pm', '11 pm',
    ]

PALM.Weather.prototype = {
    forecast: function(location) {
        var days = Date.diff(this.date, Date.today()).days+1;
        if (days <= 10 ) {
            var loc = location.lat() + ',' + location.lng();
            var uri = 'https://api.apixu.com/v1/forecast.json?key=' + 
                this.apiKey + '&q=' + loc + '&days=' + days;
            
            var me = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', uri);
            xhr.addEventListener('load', function() {
                var json = JSON.parse(this.responseText);
                me.onLoad(location, json);
            });
            xhr.send();
        }
    },
    
    onLoad: function(location, weather) {
        var days = weather.forecast.forecastday;
        var forecast = days[days.length-1];
        var marker = new google.maps.Marker({
            position: location,
            map: this.map,
            icon: {
                url: 'http://' + forecast.day.condition.icon,
                anchor:  new google.maps.Point(32,32)
            }
        });
        google.maps.event.addListener(marker, 'click', this.showInfo.bind(this, marker, forecast));

        this.markers.push(marker);
    },
    
    showInfo: function(marker, forecast) {
        var content = '<div class="weather-details">'
        //<div class="weather-details-title">Details for ' + forecast.date + '</div>';
        
        forecast.hour.forEach(function(hour) {
            var time = new Date(Date.parse(hour.time)).getHours();
            content += ('<div class="weather-details-hour">' + 
                        '<img src="'+ hour.condition.icon + '" title="' + hour.condition.text + '"/>' +
                        '<div>' + 
                            '<span>' + PALM.Weather.TIMES[time] + '</span>' +
                            '<span title="feels like">' + hour.feelslike_f + '&deg;</span>' +
                            '<span title="actual">(' + hour.temp_f + '&deg;)</span>' +
                            '<span title="humidity">' + hour.humidity + '%</span>' +
                        '</div></div>');
        });
        content += '</div>';
        
        var info = this.info;
        info.setContent(content);
        info.setPosition(marker.getPosition());
        info.open(map);
    },
    
    destroy: function() {
        this.markers.forEach(function(marker) {
            marker.setMap(null);
        });
        this.markers = [];
    }   
    
};
