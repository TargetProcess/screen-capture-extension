define(['Class'], function(Class) {

    'use strict';

    return Class.extend({

        init: function() {

            this.endpointApi = 'api/v1';
            this.endpointUpload = 'UploadFile.ashx';
            this.authToken = null;
            this.host = 'http://localhost:8080/targetprocess';
        },

        setHost: function(value) {
            this.host = value;
        },

        auth: function() {
            return this.get('Authentication');
        },

        get: function(path) {

            return Q($.ajax({
                type: 'get',
                url: this.host + '/' + this.endpointApi + '/' + path,
                data: {
                    format: 'json'
                }
            }));
        },

        post: function(path, data) {

            return Q($.ajax({
                type: 'post',
                url: this.host + '/' + this.endpointApi + '/' + path,
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
            request.open('POST', this.host + '/' + this.endpointUpload);
            request.send(form);

            return defer.promise;
        }
    });
});
