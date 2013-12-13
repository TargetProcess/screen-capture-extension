require([
    '/scripts/chrome.api.js'
    , '/scripts/targetprocess.api.js'
    , '/scripts/image-editor/actions-logger.js'
    , '/scripts/image-editor/paint-manager.js'
    , '/scripts/image-editor/ui.js'
], function(ChromeApi, TPApi, ActionsLogger, PaintManager, UI) {

    g_ready.done(function() {

        var color = '#fba617';

        $('#project, #severity, #business').fancySelect();

        // init colorpicker
        $("#custom-color").spectrum({
            color: color,
            showPalette: true,
            showPaletteOnly: true,
            maxPaletteSize: 6,
            preferredFormat: "hex",
            palette: [
                [
                    "rgb(255, 255, 255)",
                    "rgb(251, 166, 23)",
                    "rgb(121, 207, 24)",
                    "rgb(215, 30, 19)",
                    "rgb(56, 146, 227)",
                    "rgb(0, 0, 0)"
                ]
            ],
            change: function(x) {
                paintManager.changeColor(x.toString());
            }
        });

        $('input[placeholder], textarea[placeholder]').placeholder();



        var paintManager = new PaintManager(
            document.getElementById('imageView'),
            document.getElementById('imageTemp'),
            {
                font: 'bold 16px Tahoma',
                color: color,
                line: 6
            }
        );
        var actionsLogger = new ActionsLogger(paintManager, new UI());
        paintManager.changeTool("pencil");
        paintManager.setLineWidth(6);

        $(".i-role-editor .button").click(function() {
            var isDisabled = $(this).hasClass("disabled");

            if (!isDisabled) {
                $(".i-role-editor .button").removeClass("clicked");
                $(this).addClass("clicked");

                var dataTool = $(this).data('tool');
                var toolType = "pencil";

                if (dataTool === 'undo') {
                    actionsLogger.Undo();
                }
                else if (dataTool === 'redo') {
                    actionsLogger.Redo();
                }
                else if (dataTool) {
                    toolType = dataTool;
                }

                paintManager.changeTool(toolType);
            }
        });
    });


    var DOMAIN = 'http://' + settings.get_prop('domain') + '.tpondemand.com';
    var LOGIN = settings.get_prop('login');
    var PASSWORD = settings.get_prop('password');

    var tpApi = new TPApi({
        domain: DOMAIN,
        login: LOGIN,
        password: PASSWORD
    });

    $('#referenceToAccount').prop('href', DOMAIN);

    var $text = $('.i-role-screenshot-name');
    $text.focus();
    var $postTrigger = $('.i-role-trigger-post');
    $postTrigger.prop('disabled', true);

    tpApi
        .setup()
        .done(function(setup) {
            setup
                .projects
                .forEach(createOption.bind($('.i-role-projects')));
            setup
                .severities
                .forEach(createOption.bind($('.i-role-severities')));
            setup
                .priorities
                .forEach(createOption.bind($('.i-role-priorities')));

            $('#project, #severity, #business').trigger('update');

            $('.i-role-trigger-post').prop('disabled', false);
        });

    $postTrigger.one('click', function() {

        postProgress();

        var data = {
            projectId: $('.i-role-projects').val(),
            severity: $('.i-role-severities').val(),
            priority: $('.i-role-priorities').val(),
            issueName: $('.i-role-screenshot-name').val(),
            description: $('.i-role-screenshot-desc').val(),
            base64str: $('#imageView')[0].toDataURL('image/png')
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
