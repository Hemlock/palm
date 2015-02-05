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
    return this.replace(/{(.+?)}/g, function(match, name) {
        return data[name] || match;
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