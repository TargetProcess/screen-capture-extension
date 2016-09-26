define(['Class'], function(Class) {

    'use strict';

    return Class.extend({

        init: function() {

            this.endpointApi = 'api/v1';
            this.endpointUpload = 'UploadFile.ashx';
            this.authToken = null;
            this.versionGt3_9_2 = null;
            this.host = null;
            this.hostName = null;

            this.onAuth = $.Callbacks();
            this.onLogout = $.Callbacks();
        },

        setOnDemandAccount: function(name) {
            this.host = 'https://' +  name + '.tpondemand.com';
            this.hostName = name + '.tpondemand.com';
        },

        setOnSiteAccount: function(name) {
            this.host = name;
            this.hostName = name;
        },

        setHost: function(value) {
            this.host = value;
        },

        isLogged: function() {
            return Boolean(this.authToken);
        },

        auth: function() {
            return this
                .get('Authentication')
                .then(function(data) {
                    this.authToken = data.Token;

                    $.get(this.host + '/info.ashx')
                        .then(function (info) {
                            var tokens = info.version.split('.');
                            var version = parseInt(tokens[0]) * 10000 + parseInt(tokens[1]) * 100 + parseInt(tokens[2]);
                            this.versionGt3_9_2 = (version >= 30902);
                            this.onAuth.fire();
                        }.bind(this));
                }.bind(this));
        },

        getCurrentUser: function() {
            return this
                .get('context.asmx')
                .then(function(data) {
                    var userData = data.LoggedUser;
                    var user = {
                        name: [userData.FirstName, userData.LastName].join(' ').trim(),
                        avatarSrc: this.host + '/avatar.ashx?UserId=' + userData.Id + '&size=100'
                    };

                    return user;
                }.bind(this));
        },

        logout: function() {
            this.authToken = null;
            this.onLogout.fire();
        },

        get: function(path, data) {

            return Q($.ajax({
                type: 'get',
                url: this.host + '/' + this.endpointApi + '/' + path,
                data: _.extend({
                    format: 'json'
                }, data)
            }))
            .catch(function(err) {
                if (!err.status) {
                    throw new Error('Unknown error');
                } else {
                    throw new Error(err.statusText);
                }
            });
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
            form.append('files[]', blob, 'targetprocess-screen-capture.png');

            var defer = Q.defer();

            var request = new XMLHttpRequest();
            request.onerror = defer.reject;
            request.onload = function() {
                if (request.status === 200) {
                    var attachData = JSON.parse(request.responseText).items[0];
                    var attach = {
                        name: attachData[2],
                        url: attachData[4],
                        thumbnailUrl: attachData[5]
                    };
                    defer.resolve(attach);
                } else {
                    defer.reject(new Error('Status code was ' + request.status));
                }
            };
            request.upload.onprogress = function onprogress(event) {
                defer.notify(event.loaded / event.total);
            };
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

        getForm: function(name, title) {

            var newApi = (this.versionGt3_9_2 === true);

            var restPath = (
                (newApi) ?
                    ('/slice/v1/matrix/listDataTemplates') :
                    ('/slice/v1/matrix/listDataTemplate')
            );

            var args = {
                base64: true,
                definition: {
                    cells: {
                        items: [{id: name}]
                    }
                }
            };

            if (newApi) {
                args.dataItemTypes = [name];
            } else {
                args.dataItemType = name;
            }

            return Q($.ajax({
                type: 'post',
                url: this.host + restPath,
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json',
                data: JSON.stringify(args)
            })).then(function(data) {

                // below 3.9.2
                if (!newApi) {
                    return data.items;
                }

                // >= 3.9.2
                var items = data
                    .items
                    .filter(function(item) {
                        var res = item.availableResource;
                        return (res.name + res.title).toLowerCase() === (name + title).toLowerCase();
                    });

                var formItem = (items.length > 0) ? items[0] : {fieldTemplates: {items: []}};

                return formItem.fieldTemplates.items;
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
            }, function(data) {
                throw new Error(data.responseJSON.Message);
            });
        }
    });
});
