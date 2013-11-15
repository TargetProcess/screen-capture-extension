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
        .fetchProjects()
        .done(function (r) {
            var $projs = $('.i-role-projects');
            r.Items.forEach(function (item) {
                $projs.append('<option value="' + item.Id + '">' + item.Name + '</option>');
            });
            $('.i-role-trigger-post').prop('disabled', false);
        });

    $postTrigger.one('click', function () {
        var description = '<p>test</p>';

        tpApi
            .postBugToTargetProcess(
                $('.i-role-projects').val(),
                $text.val(),
                description,
                $('#target').prop('src')
            )
            .done(function (r) {
                $('<div></div>')
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
                    .html([
                        '<h1>',
                            '<a ',
                            '   style="position:fixed;top:25%;left:5%;color:#fff"',
                            '   href="' + DOMAIN + '/RestUI/Board.aspx?#page=bug/' + r.Id + '">',
                            'Open bug [#' + r.Id + '] in TargetProcess',
                            '</a>',
                        '</h1>'
                    ].join(''))
                    .appendTo('body');
            });
    });
});