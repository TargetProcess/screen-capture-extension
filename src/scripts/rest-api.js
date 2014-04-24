/*globals Q */
define(['Class'], function(Class) {
    'use strict';

    return Class.extend({

        init: function() {
            this.endpoint = '/targetprocess/api/v1';
            this.endpointUpload = '/targetprocess/UploadFile.ashx';
            this.authToken = null;
        },

        auth: function() {
            return this.get('Authentication');
        },

        get: function(path) {
            return Q($.ajax({
                type: 'get',
                url: this.endpoint + '/' + path,
                data: {
                    format: 'json'
                }
            }));
        },

        post: function(path, data) {
            return Q($.ajax({
                type: 'post',
                url: this.endpoint + '/' + path,
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify(data)
            }));
        },

        postAttach: function(entityData, fileData) {
            var b64Png = fileData.split(',')[1];

            var binary = atob(b64Png);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }

            var blob = new Blob([new Uint8Array(array)], {
                type: 'image/png'
            });

            var form = new FormData();

            form.append('generalId', entityData.Id);
            form.append('files[]', blob, 'chrome-screenshot.png');

            var defer = Q.defer();

            var request = new XMLHttpRequest();
            request.onerror = defer.reject;
            request.onload = defer.resolve;
            request.open('POST', this.endpointUpload);
            request.send(form);

            return defer.promise;
        },

        create: function(entityTypeName, data) {
            var defer = Q.defer();

            $.ajax({
                type: 'post',
                url: this.endpoint + '/' + entityTypeName,
                data: JSON.stringify(data),
                // dataType: 'json',
                contentType: 'application/json'
            }).then(function() {
                defer.resolve();
            });

            return defer.promise;
        }
    });
});
