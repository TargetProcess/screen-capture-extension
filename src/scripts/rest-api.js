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

        isLogged: function() {
            return Boolean(this.authToken);
        },

        auth: function() {
            return this.get('Authentication').then(function(data) {
                this.authToken = data.Token;
            }.bind(this));
        },

        logout: function() {
            this.authToken = null;
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

        postAttach: function(entityId, fileData) {

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

            form.append('generalId', entityId);
            form.append('files[]', blob, 'chrome-screenshot.png');

            var defer = Q.defer();

            var request = new XMLHttpRequest();
            request.onerror = defer.reject;
            request.onload = defer.resolve;
            request.open('POST', this.host + '/' + this.endpointUpload);
            request.send(form);

            return defer.promise;
        },

        getForms: function(ids) {
            return Q($.ajax({
                type: 'post',
                url: this.host + '/slice/v1/matrix/listModeActionsV2',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    base64: true,
                    definition: {
                        cells: {
                            items: ids.map(function(v) {
                                return {
                                    id: v
                                };
                            })
                        }
                    }
                })
            })).then(function(data) {

                return data.items[0].fixed.items[0].data.types;
            });
        },

        getForm: function(id) {
            return Q($.ajax({
                type: 'post',
                url: this.host + '/slice/v1/matrix/listDataTemplate',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    base64: true,
                    dataItemType: id,
                    definition: {
                        cells: {
                            items: [{
                                id: id
                            }]
                        }
                    }
                })
            })).then(function(data) {
                return data.items;
            });
        },

        submitForm: function(id, values) {
            return Q($.ajax({
                type: 'post',
                url: this.host + '/slice/v1/matrix/listAddData',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify({
                    base64: true,
                    type: id,
                    values: values,
                    definition: {
                        cells: {
                            items: [{
                                id: id
                            }]
                        }
                    }
                })
            })).then(function(data) {
                return data[0].dataItem.data;
            });
        }
    });
});
