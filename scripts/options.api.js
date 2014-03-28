define([], function() {

    var OptionsService = function(settings) {
        this.settings = settings;
    };

    OptionsService.prototype = {

        getFullDomain: function() {
            return 'http://' + settings.get_prop('domain') + '.tpondemand.com';
        },

        getDomain: function() {
            return this.settings.get_prop('domain');
        },

        setDomain: function(val) {
            this.settings.set_prop('domain', val);
        },

        getAuthToken: function() {
            return this.settings.get_prop('auth-token');
        },

        setAuthToken: function(val) {
            this.settings.set_prop('auth-token', val);
        }
    };

    return OptionsService;

});