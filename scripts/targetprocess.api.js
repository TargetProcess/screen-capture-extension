define([], function() {

    var API = function(optionsService) {
        this.optionsService = optionsService;
    };

    API.prototype = {

        auth: function() {
            var url = '/api/v1/Authentication?format=json';
            var $result = $.Deferred();

            this.req(url, null, true)
                .fail(function(r) {
                    console.log('fail:', r);
                    if (r.status === 404) {
                        // retry
                        this.auth()
                            .fail($result.reject)
                            .done($result.resolve);
                    }
                    else {
                        $result.reject(r);
                    }

                }.bind(this))
                .done(function(r) {
                    console.log('done:', r);
                    this.optionsService.setAuthToken(r.Token);
                    $result.resolve();
                }.bind(this));

            return $result;
        },

        setup: function() {
            var $result = $.Deferred();

            var $dTId = this.getEntityTypeId('Bug');
            var $dPrs = $dTId.then(this.fetchPriorities.bind(this));
            var $dSev = this.fetchSeverities();
            var $dPrj = this.fetchProjects();
            var $dTms = this.fetchTeams();

            $
                .when($dTId, $dPrj, $dTms, $dSev, $dPrs)
                .then(function(entityTypeId, projects, teams, severities, priorities) {
                    $result.resolve({
                        entityTypeId: entityTypeId,
                        projects: projects.Items,
                        teams: teams.Items,
                        severities: severities.Items,
                        priorities: priorities.Items
                    });
                });

            return $result;
        },

        req: function(url, data, avoidToken) {

            var token = this.optionsService.getAuthToken();

            var cfg = {

                url: [
                    this.optionsService.getFullDomain(),
                    url,
                    (avoidToken ? '' : '&token=' + token)
                ].join(''),

                method: 'GET',
                dataType: 'json',
                contentType: 'application/json; charset=UTF-8'
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
                    Items.splice(0, 0, { Id: 0, Name: 'No Project' });
                    $result.resolve({ Items: Items });
                });
            return $result;
        },

        fetchTeams: function() {
            var $result = $.Deferred();
            //this.req("/api/v1/teams?resultInclude=[Id,Name,Project[Id]]&where=IsActive eq 'true'")
            this.req("/api/v1/teams?resultInclude=[Id,Name,Project[Id]]")
                .done(function(r) {
                    var Items = r.Items;
                    Items.splice(0, 0, { Id: 0, Name: 'No Team' });
                    $result.resolve({ Items: Items });
                });
            return $result;
        },

        postBugToTargetProcess: function(data) {

            var projectId = parseInt(data.projectId, 10);
            var teamId = parseInt(data.teamId, 10);
            var severity = parseInt(data.severity, 10);
            var priority = parseInt(data.priority, 10);
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
                    Project: projectId ? { Id: projectId } : null,
                    Team: teamId ? { Id: teamId } : null
                })
                .fail($result.reject)
                .done(function(r) {
                    this.postAttachmentToTargetProcess(r.Id, base64str)
                        .fail($result.reject)
                        .done($result.resolve.bind($result, r));
                }.bind(this));

            return $result;
        },

        postAttachmentToTargetProcess: function(issueId, base64str) {

            // "data:image/png;base64,..."
            //                        ^^^
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
            request.onerror = $result.reject;
            request.onload = $result.resolve;
            request.open(
                'POST',
                [
                    this.optionsService.getFullDomain(),
                    '/UploadFile.ashx'
                ].join('')
            );
            request.send(form);

            return $result;
        }
    };

    return API;

});