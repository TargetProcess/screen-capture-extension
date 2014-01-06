define([], function() {

    var API = function(credentials) {
        this.domain = credentials.domain;
        this.login = credentials.login;
        this.password = credentials.password;
    };

    API.prototype = {

        setup: function() {
            var $result = $.Deferred();

            var $dTId = this.getEntityTypeId('Bug');
            var $dPrs = $dTId.then(this.fetchPriorities.bind(this));
            var $dSev = this.fetchSeverities();
            var $dPrj = this.fetchProjects();

            $
                .when($dTId, $dPrj, $dSev, $dPrs)
                .then(function(entityTypeId, projects, severities, priorities) {
                    $result.resolve({
                        entityTypeId: entityTypeId,
                        projects: projects.Items,
                        severities: severities.Items,
                        priorities: priorities.Items
                    });
                });

            return $result;
        },

        req: function(url, data) {
            var cfg = {
                method: 'GET',
                url: this.domain + url,
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader(
                        'Authorization',
                        'Basic ' + btoa(this.login + ':' + this.password)
                    );
                }.bind(this)
            };

            if (data) {
                cfg.data = JSON.stringify(data);
                cfg.method = 'POST';
            }

            return $.ajax(cfg);
        },

        getEntityTypeId: function(entityName) {
            var $result = $.Deferred();
            this.req("/api/v1/entitytypes.asmx?include=[Id]&where=Name eq '" + entityName + "'")
                .done(function(r) {
                    $result.resolve(r.Items[0].Id);
                });
            return $result;
        },

        fetchSeverities: function() {
            var $result = $.Deferred();
            this.req('/api/v1/severities?orderByDesc=Id&resultInclude=[Id,Name]')
                .done(function (r) {
                    $result.resolve(r)
                });
            return $result;
        },

        fetchPriorities: function(entityTypeId) {
            var $result = $.Deferred();
            this.req('/api/v1/priorities?orderByDesc=Id&resultInclude=[Id,Name]&where=EntityType.Id eq ' + entityTypeId)
                .done(function (r) {
                    $result.resolve(r)
                });
            return $result;
        },

        fetchProjects: function() {
            var $result = $.Deferred();
            this.req("/api/v1/projects?resultInclude=[Id,Name,Process[Id,Practices]]&where=IsActive eq 'true'")
                .done(function(r) {
                    var Items = r.Items.filter(function(item) {
                        return item
                            .Process
                            .Practices
                            .Items
                            .some(function(practice) {
                                return practice.Name === 'Bug Tracking';
                            });
                    });
                    $result.resolve({ Items: Items });
                });
            return $result;
        },

        postBugToTargetProcess: function(data) {

            var projectId = data.projectId;
            var severity = data.severity;
            var priority = data.priority;
            var issueName = data.issueName;
            var description = data.description;
            var base64str = data.base64str;

            var $result = $.Deferred();

            this.req(
                '/api/v1/Bugs?resultInclude=[Id,Name]',
                {
                    Name: issueName,
                    Description: description,
                    Severity: { Id: severity },
                    Priority: { Id: priority },
                    Project: { Id: projectId }
                })
                .done(function(r) {
                    this.postAttachmentToTargetProcess(r.Id, base64str)
                        .done($result.resolve.bind($result, r));
                }.bind(this));

            return $result;
        },

        postAttachmentToTargetProcess: function(issueId, base64str) {

            // "data:image/png;base64,..."
            var b64Png = base64str.split(',')[1];

            var binary = atob(b64Png);
            var array = [];
            for (var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }

            var blob = new Blob([new Uint8Array(array)], {type: 'image/png'});

            var form = new FormData();

            form.append('generalId', issueId);
            form.append('files[]', blob, 'chrome-screenshot.png');

            var $result = $.Deferred();

            var request = new XMLHttpRequest();
            request.onload = $result.resolve;
            request.open('POST', this.domain + '/UploadFile.ashx');
            request.send(form);

            return $result;
        }
    };

    return API;

});