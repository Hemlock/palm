PALM.Options = {
    initialize: function() {
        this.state = {};
        this.loadState();

        this.container = document.createElement('div');
        this.container.id = 'map-options';
        document.body.appendChild(this.container);

        this.buildDaySelector(); 
        this.buildTypeCheckboxes();

        var day = this.state.folder == PALM.Routes.folder ? this.state.day : 0;
        Object.assign(this.state, { day: day, folder: PALM.Routes.folder });
        PALM.Routes.load(day, this.updatePlaces, this);
    },

    loadState: function() {
        var def = { day: 0, folder: PALM.Routes.folder, checked: null };
        this.state = PALM.Storage.get('options', def);
        if (this.state instanceof Array) {
            debugger
            this.state = def;
            this.saveState();
        }
    },

    saveState: function() {
        PALM.Storage.set('options', this.state);
    },

    buildDaySelector: function() {
        var doc = this.container.ownerDocument;
        this.daySelector = doc.createElement('select');
        PALM.RouteInfo.days.forEach((day, index) => {
            let option = doc.createElement('option');
            option.value = day[1];
            option.innerHTML = day[0];
            option.selected = (index == this.state.day);

            this.daySelector.appendChild(option);
        });
        this.container.appendChild(this.daySelector);
        this.daySelector.addEventListener('change', ()=> {
            var day = this.daySelector.selectedIndex;
            this.state.day = day;
            PALM.Routes.load(day, this.updatePlaces, this);
            this.saveState();
        });
    },
    
    buildTypeCheckboxes: function() {
        var doc = this.container.ownerDocument;
        var checked = this.state.checked
         ? this.state.checked.map((name) => PALM.Types.byName[name]) 
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

        this.state.checked = names;
        this.saveState();
        
        let types = PALM.Types.filter((type) => ~names.indexOf(type.name));
        places.search(types, PALM.Routes.current);    
    }
};