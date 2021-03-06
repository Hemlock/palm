Array.toArray = function(obj, start) {
   return Array.prototype.slice.call(obj, start); 
};

Function.prototype.mixin = function() {
    var mixins = Array.toArray(arguments);
    mixins.forEach(function(mixin) {
        Object.extend(this.prototype, mixin.prototype || mixin);
    }, this);
};

String.prototype.format = function(data) {
    if (data instanceof Array) {
    } else if (data instanceof Object) {
        args = [{}].concat(Array.toArray(arguments));
        data = Object.extend.apply(Object, args)
    } else {
        data = Array.toArray(arguments);
    }
    return this.replace(/{(.+?)}/g, function(match, name) {
        return (name in data) ? data[name] : match;
    });
};

Object.extend = function(target) {
    Array.toArray(arguments, 1).forEach(function(source) {
        var fld;
        for (fld in source) {
            if (source.hasOwnProperty(fld)) {
                target[fld] = source[fld];
            }
        }
    });
    return target;
};

Date.DAY = 1000 * 60 * 60 * 24;
Date.addDays = function(date, days) {
    return new Date(date.getTime() + (days * Date.DAY));
};

Date.today = function() {
    var date = new Date();
    date.setMinutes(0);
    date.setHours(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};

Date.diff = function() {
    function toTimeSpan(ms) {
      var d, h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return { days: d, hours: h, minutes: m, seconds: s };
    }
    
    function toMS(v) {

        if (v instanceof Date) {
            return v.getTime();
        }
        
        if (typeof v == 'string') {
            return Date.parse(v);
        }
        
        return v;
    }
    
    return function(a, b) {
        a = toMS(a);
        b = toMS(b);
        return toTimeSpan(a-b);
    }
}();

Date.prototype.toISOShort = function() {
    return this.toISOString().substring(0,10);
};

function css(text) {
    let style = document.createElement('style')
    style.setAttribute('type', 'text/css');
    style.appendChild(document.createTextNode(text))
    document.getElementsByTagName('HEAD')[0].appendChild(style);
}

{
    var div = document.createElement('div')
    function html(html, parent) {
        div.innerHTML = html;
        var el = div.children[0];
        (parent || document.body).appendChild(el);

        return el;
    }
}
