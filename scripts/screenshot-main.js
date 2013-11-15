require([
      '/scripts/chrome.api.js'
    , '/scripts/targetprocess.api.js'
], function(ChromeApi, TPApi) {

    var DOMAIN = 'http://' + settings.get_prop('domain') + '.tpondemand.com';
    var LOGIN = settings.get_prop('login');
    var PASSWORD = settings.get_prop('password');

    var tpApi = new TPApi({
        domain: DOMAIN,
        login: LOGIN,
        password: PASSWORD
    });

    var $text = $('.i-role-screenshot-name');
    $text.focus();
    var $postTrigger = $('.i-role-trigger-post');
    $postTrigger.prop('disabled', true);

    tpApi
        .setup()
        .done(function (setup) {
            setup
                .projects
                .forEach(createOption.bind($('.i-role-projects')));
            setup
                .severities
                .forEach(createOption.bind($('.i-role-severities')));
            setup
                .priorities
                .forEach(createOption.bind($('.i-role-priorities')));

            $('.i-role-trigger-post').prop('disabled', false);
        });

    $postTrigger.one('click', function () {

        postProgress();

        var data = {
            projectId: $('.i-role-projects').val(),
            severity: $('.i-role-severities').val(),
            priority: $('.i-role-priorities').val(),
            issueName: $('.i-role-screenshot-name').val(),
            description: $('.i-role-screenshot-desc').val(),
            base64str: $('#target').prop('src')
        };

        tpApi
            .postBugToTargetProcess(data)
            .done(postSucceeded)
            .fail(postFailed);
    });

    var createOption = function(item) {
        this.append('<option value="' + item.Id + '">' + item.Name + '</option>');
    };

    var showOverlay = function($content) {
        var $over = $('.i-role-overlay');
        if (!$over.length) {
            $over = $('<div class="i-role-overlay"></div>')
                .css({
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    'background-color': '#000',
                    filter: 'alpha(opacity=50)',
                    '-moz-opacity': 0.5,
                    '-khtml-opacity': 0.5,
                    opacity: 0.5,
                    'z-index': 10000
                })
                .appendTo('body');
        }
        $over.empty().append($content);
    };

    var postSucceeded = function(r) {
        showOverlay($([
            '<h1 style="position:fixed;top:40%;left:45%;">',
            '<a style="color:#fff" href="' + DOMAIN + '/RestUI/Board.aspx?#page=bug/' + r.Id + '">',
            'Open bug [#' + r.Id + '] in TargetProcess',
            '</a>',
            '</h1>'
        ].join('')));
    };

    var postFailed = function() {
        showOverlay($('<h1 style="position:fixed;top:40%;left:45%;"><p style="color:#fff">Post is failed</p></h1>'));
    };

    var postProgress = function() {
        showOverlay($('<h1 style="position:fixed;top:40%;left:45%;"><p style="color:#fff">Post is in progress</p></h1>'));
    };
});