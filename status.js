css(`
.status {
    display: none;
    position: absolute;
    bottom: 0;
    right: 0;
    border: 2px solid red;
    padding: 5px;
    background-color: white;
    box-shadow: 0 0 3px #eee;
    border: 1px solid #ddd;
}
`);

PALM.Status = {
    initialize: function(options) {
        Object.assign(this, options);
        this.el  = document.createElement('div')
        this.el.className = 'status';
        document.body.appendChild(this.el);
        
        this.places.on('update', () => {
            var count = this.places.running + this.places.queue.length
            this.el.innerHTML = count + ' searches loading...';
            this.el.style.display = count ? 'block' : 'none';
        });
    }
};
