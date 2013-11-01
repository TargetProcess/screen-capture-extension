function UserSettings(storage) {
    this._storage = storage;
}

UserSettings.prototype = {
    get_prop: function(propertyName) {
        return this._storage[propertyName] || '';
    },

    set_prop: function(propertyName, value) {
        return this._storage[propertyName] = value;
    }
};

var settings = new UserSettings(localStorage);