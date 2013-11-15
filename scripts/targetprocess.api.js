define([], function() {

    var API = function(credentials) {
        this.domain = credentials.domain;
        this.login = credentials.login;
        this.password = credentials.password;
    };

    API.prototype = {

        fetchProjects: function() {

            return $
                .ajax({
                    method: 'GET',
                    url: this.domain + '/api/v1/projects?resultInclude=[Id,Name]',
                    dataType: 'json',
                    contentType: 'application/json',
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader(
                            'Authorization',
                            'Basic ' + btoa(this.login + ':' + this.password)
                        );
                    }
                });
        },

        postBugToTargetProcess: function(projectId, issueName, description, base64str) {

            var $result = $.Deferred();

            $
                .ajax({
                    method: 'POST',
                    url: this.domain + '/api/v1/Bugs?resultInclude=[Id,Name]',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        Name: issueName,
                        Description: description,
                        Project: { Id: projectId }
                    }),
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader(
                            'Authorization',
                            'Basic ' + btoa(this.login + ':' + this.password)
                        );
                    }
                })
                .done(function(r) {
                    this.postAttachmentToTargetProcess(r.Id, base64str).done($result.resolve);
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