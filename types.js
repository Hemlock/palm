PALM.Types = [
    {
        name: 'Restaurant',
        term: 'food',
        checked: true,
        keeps: [
            'restaurant',
            'cafe',
            'meal_takeaway',
            'meal_delivery'
        ],
        icon: 'restaurant'
    }, {
        name: 'Store',
        term: 'store',
        keeps: [
            'supermarket',
            'convienience_store',
            'grocery_or_supermarket',
            'food'
        ],
        icon: 'shopping'
    }, {
        name: 'Laundry',
        term: 'laundry',
        keeps: ['laundry'],
        icon: 'dot'
    }, {
        name: 'Parks',
        term: 'park',
        keeps: ['park'],
        skips: ['campground', 'rv_park'],
        icon: 'tree'

    }, {
        name: 'Lodging',
        term: 'lodging',
        types: ['lodging'],
        skips: ['campground', 'rv_park'],
        icon: 'lodging'
    }
];

PALM.Types.byName = PALM.Types.reduce((memo, type) => {
    memo[type.name] = type;
    return memo;
}, {});
