PALM.Options = {
    initialize: function() {
        this.container = document.createElement('div');
        this.container.id = 'map-options';
        document.body.appendChild(this.container);

        this.buildDaySelector(); 
        this.buildTypeCheckboxes();
        PALM.Routes.load(0, this.updatePlaces, this);
    },

    buildDaySelector: function() {
        var doc = this.container.ownerDocument;
        this.daySelector = doc.createElement('select');
        PALM.RouteInfo.days.forEach((day) => {
            let option = doc.createElement('option');
            option.value = day[1];
            option.innerHTML = day[0];
            this.daySelector.appendChild(option);
        });
        this.container.appendChild(this.daySelector);
        this.daySelector.addEventListener('change', ()=> {
            PALM.Routes.load(this.daySelector.selectedIndex, this.updatePlaces, this);
        });
    },
    
    buildTypeCheckboxes: function() {
        var doc = this.container.ownerDocument;
        var saved = PALM.Storage.get('options');
        var checked = saved 
         ? saved.map((name) => PALM.Types.byName[name]) 
         : PALM.Types.filter((type) => type.checked);

        this.checkboxes = [];
        PALM.Types.forEach((type) => {
            let label = doc.createElement('label');
            label.classList.add('icon', type.icon);
            let checkbox = doc.createElement('input');
            checkbox.setAttribute('type', 'checkbox');
            checkbox.setAttribute('name', type.name);
            checkbox.checked = !!~checked.indexOf(type);
            checkbox.value = type.term;
            checkbox.addEventListener('click', () => this.updatePlaces());
            this.checkboxes.push(checkbox);
            label.appendChild(checkbox, 0);
            label.appendChild(doc.createTextNode(type.name));
            this.container.appendChild(label);
        });
    },

    updatePlaces: function() {
        var names = this.checkboxes.reduce((memo, checkbox) => {
            if (checkbox.checked) {
                memo.push(checkbox.getAttribute('name'));
            }
            return memo;
        }, []);

        PALM.Storage.set('options', names);
        
        let types = PALM.Types.filter((type) => ~names.indexOf(type.name));
        places.search(types, PALM.Routes.current);    
    }
};