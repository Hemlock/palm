String.prototype.format = function(data) {
    return this.replace(/{(.+?)}/g, function(match, name) {
        return data[name] || match;
    });
}