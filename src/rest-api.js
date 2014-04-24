define(['./libs/class'], function(Class) {
    'use strict';

    return Class.extend({

        init: function() {
            this.endpoint = 'http://shitkin/localhost/api/v1';
        },

        create: function(entityTypeName, data) {
            var defer = Q.defer();

            $.ajax({
                url: this.endpoint + '/' + entityTypeName,
                data: data,
                contentType: 'json'
            }.then(function() {
                defer.resolve();
            }));

            return defer.promise;
        }
    });
});
