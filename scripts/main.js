/*global chrome, require*/
require([], function() {

    var DOMAIN = 'http://' + settings.get_prop('domain') + '.tpondemand.com';
    var LOGIN = settings.get_prop('login');
    var PASSWORD = settings.get_prop('password');

    var fetchProjects = function() {
        return $
            .ajax({
                method: 'GET',
                url: DOMAIN + '/api/v1/projects?resultInclude=[Id,Name]',
                dataType: 'json',
                contentType: 'application/json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader(
                        'Authorization',
                        'Basic ' + btoa(LOGIN + ':' + PASSWORD)
                    );
                }
            });
    };

    chrome.extension.onRequest.addListener(function(request, sender, callback) {
        var fn = {
            'tp-chrome-extension/screen': function(r) {
                //
            },
            'capturePage': function() {
                console.log('capture-page');
            },
            'openPage': function() {
                console.log('open-page');
            }
        }[request.msg];

        fn && fn(request, sender, callback);
    });


    var postBugToTargetProcess = function(projectId, issueName, description, base64str) {

        var $result = $.Deferred();

        $
            .ajax({
                method: 'POST',
                url: DOMAIN + '/api/v1/Bugs?resultInclude=[Id,Name]',
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
                        'Basic ' + btoa(LOGIN + ':' + PASSWORD)
                    );
                }
            })
            .done(function(r) {
                postAttachmentToTargetProcess(r.Id, base64str).done($result.resolve);
            });

        return $result;
    };

    var postAttachmentToTargetProcess = function(issueId, base64str) {

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
        request.open('POST', DOMAIN + '/UploadFile.ashx');
        request.send(form);

        return $result;
    };

    var captureTab = function() {
        var d = $.Deferred();

        chrome.tabs.captureVisibleTab(
            null,
            {
                format: 'png'
            },
            function(base64str) {
                if (base64str) {
                    d.resolve(base64str);
                }
                else {
                    d.reject();
                }
            });

        return d;
    };


    chrome.tabs.getSelected(null, function(tab) {

        var fnSendRequest = function() {
            chrome.extension.sendRequest(
                {
                    msg: 'tp-chrome-extension/screen',
                    val: 'test!'
                },
                function(response) {
                }
            );
        };

        chrome.tabs.executeScript({
            code: '(' + fnSendRequest.toString() + ')()'
        });


        var $box = $('#box');
        var $btn = $('.i-role-trigger-take');
        $btn.on('click', function() {

            $box.removeClass('take-screenshot');

            captureTab()
                .fail(function() {
                    alert('error');
                })
                .done(function(base64str) {

                    $('.i-role-trigger-post').prop('disabled', true);
                    fetchProjects().done(function(r) {
                        var $projs = $('.i-role-projects');
                        r.Items.forEach(function(item) {
                            $projs.append('<option value="' + item.Id + '">' + item.Name + '</option>');
                        });
                        $('.i-role-trigger-post').prop('disabled', false);
                    });

                    $(new Image())
                        .prop('src', base64str)
                        .css('width', '100%')
                        .appendTo('.i-role-screenshot-holder');

                    $box.addClass('post-screenshot');
                    var $text = $('.i-role-screenshot-name');
                    $text.focus();

                    $('.i-role-trigger-post').one('click', function() {
                        var description = '<p>test</p>';

                        postBugToTargetProcess(
                            $('.i-role-projects').val(),
                            $text.val(),
                            description,
                            base64str)
                            .done(function() {
                                $box.removeClass('post-screenshot')
                                    .addClass('take-screenshot');
                            });
                    });
                });
        });
    });
});
