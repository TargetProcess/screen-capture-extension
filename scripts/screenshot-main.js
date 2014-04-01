require([
    '/scripts/chrome.api.js'
    , '/scripts/targetprocess.api.js'
    , '/scripts/options.api.js'
    , '/scripts/image-editor/paint-manager.js'
], function(ChromeApi, TPApi, OptionsService, PaintManager) {


    $(function() {
        var hash = location.hash;
        var key = '#b64=';
        if (0 === hash.indexOf(key)) {
            setScreenshotUrl(hash.substr(key.length));
        }
        else if (localStorage['image-backup-on'] != 1) {
            setScreenshotUrl(localStorage['image-backup']);
        }
    });


    var showOptions = function(optionsService, tpApi) {

        $('article').addClass('scale-down');
        $('#optionsContainer').addClass('view');
        var $overlay = $('<div></div>').appendTo('body').addClass('overlay');
        $overlay
            .one('click', function() {
                $('article').removeClass('scale-down');
                $('#optionsContainer').removeClass('view');
                $overlay.remove();
            });

        var $saveButton = $('#save');
        var $domainOption = $('#domain.option');
        $domainOption.val(optionsService.getDomain());


        var triggerAuth = function() {

            $domainOption.css('background-color', '');

            if (!$domainOption.val()) {
                $domainOption
                    .focus()
                    .css('background-color', 'pink');

                $('.i-role-footer-state').hide();
                $('.i-role-new-member').show();
                $saveButton.text('Login');
                return;
            }

            optionsService.setDomain($domainOption.val());

            tpApi
                .auth()
                .fail(function() {
                    $saveButton.text('Try login again!');
                    $('.i-role-footer-state').hide();
                    $('.i-role-new-member').show();
                })
                .done(function() {
                    $saveButton.text('Already logged in!');
                    $('.i-role-footer-state').hide();
                    $('.i-role-logout').show();
                });
        };



        triggerAuth();
        $saveButton.on('click', triggerAuth);



        $('.i-role-logout-trigger').on('click', function() {
            optionsService.setDomain('');
            optionsService.setAuthToken('');
            $domainOption.val(optionsService.getDomain());
            triggerAuth();
        });
    };


    var setupPostParameters = function(optionsService, tpApi, fabricCanvas) {

        $('article').addClass('scale-down');
        $('.post-screenshot-container').addClass('view');
        var $overlay = $('<div></div>').appendTo('body').addClass('overlay');
        $overlay
            .one('click', function() {
                $('article').removeClass('scale-down');
                $('.post-screenshot-container').removeClass('view');
                $overlay.remove();
            });

        var $text = $('.i-role-screenshot-name');
        $text.focus();
        var $postTrigger = $('.i-role-trigger-post');
        $postTrigger.prop('disabled', true);

        tpApi
            .setup()
            .done(function(setup) {
                setup
                    .projects
                    .forEach(createOption.bind($('.i-role-projects'), settings.get_prop('project')));
                setup
                    .teams
                    .forEach(createOption.bind($('.i-role-teams'), settings.get_prop('team')));
                setup
                    .severities
                    .forEach(createOption.bind($('.i-role-severities'), null));
                setup
                    .priorities
                    .forEach(createOption.bind($('.i-role-priorities'), null));

                $('#team, #project, #severity, #business').trigger('update');

                $('.i-role-trigger-post').prop('disabled', false);
            });

        $postTrigger.on('click', function() {

            var data = {
                teamId: $('.i-role-teams').val(),
                projectId: $('.i-role-projects').val(),
                severity: $('.i-role-severities').val(),
                priority: $('.i-role-priorities').val(),
                issueName: $('.i-role-screenshot-name').val(),
                description: $('.i-role-screenshot-desc').val()
                    .replace(/\r\n/g, '<br />')
                    .replace(/\n/g, '<br />'),
                base64str: fabricCanvas.toDataURL()
            };

            settings.set_prop('project', data.projectId);
            settings.set_prop('team', data.teamId);


            if (!data.issueName) {
                var VALIDATION_CLASS = 'tp-extension-validation-failed';
                var fnStopHighlight = function () {
                    $(this).removeClass(VALIDATION_CLASS);
                };
                $('.i-role-screenshot-name')
                    .off('.ext-validation')
                    .one('keyup.ext-validation', fnStopHighlight)
                    .one('click.ext-validation', fnStopHighlight)
                    .addClass(VALIDATION_CLASS)
                    .focus();

                return;
            }


            postProgress();
            tpApi
                .postBugToTargetProcess(data)
                .done(postSucceeded)
                .fail(postFailed);
        });

        var createOption = function(defaultValue, item) {
            var isSelected = (item.Id == defaultValue) ? ' selected ': '';
            this.append('<option ' + isSelected + ' value="' + item.Id + '">' + item.Name + '</option>');
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

        var hideOverlay = function() {
            var $over = $('.i-role-overlay');
            $over.remove();
        };

        var postSucceeded = function(r) {
            showOverlay($([
                '<h1 style="position:fixed;top:40%;left:45%;">',
                '<a style="color:#fff" href="' + optionsService.getFullDomain() + '/RestUI/Board.aspx?#page=bug/' + r.Id + '">',
                'Open bug [#' + r.Id + '] in TargetProcess',
                '</a>',
                '</h1>'
            ].join('')));
        };

        var postFailed = function(r) {
            var err;
            try {
                err = r.responseJSON.Error.Message;
            }
            catch(ex) {
                err = 'Post is failed';
            }

            var $cont = $('<h1 style="position:fixed;top:40%;left:45%;"></h1>');
            $cont.append($('<p style="color:#ff0000">' + err + '</p>'));
            var $tryAgain = $('<p style="color:#ffffff;cursor: pointer">Try again</p>');
            $tryAgain.click(hideOverlay);
            $cont.append($tryAgain);
            showOverlay($cont);
        };

        var postProgress = function() {
            showOverlay($('<h1 style="position:fixed;top:40%;left:45%;"><p style="color:#fff">Post is in progress</p></h1>'));
        };

    };

    g_ready.done(function(fabricCanvas) {

        var color = '#fba617';

        $('#team, #project, #severity, #business').fancySelect();

        // init colorpicker
        $("#custom-color").spectrum({
            className: 'i-role-tool tool-button',
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


        $('.i-role-open-settings-trigger').click(function() {

            showOptions(optionsService, tpApi);

        });

        $('.i-role-post-form-trigger').click(function() {

            tpApi
                .auth()
                .fail(function() {
                    showOptions(optionsService, tpApi);
                })
                .done(function() {
                    setupPostParameters(optionsService, tpApi, fabricCanvas);
                });
        });


        var paintManager = new PaintManager(
            fabricCanvas,
            {
                font: 'bold 16px Tahoma',
                color: color,
                line: 1
            }
        );

        paintManager.setLineWidth(3);
        paintManager.changeTool("pencil");

        $(".i-role-editor .i-role-tool").click(function() {
            var isDisabled = $(this).hasClass("disabled");
            if (!isDisabled) {
                $(".i-role-editor .i-role-tool").removeClass("clicked");
                $(this).addClass("clicked");

                var dataTool = $(this).data('tool');
                var toolType = dataTool ? dataTool : "pencil";
                paintManager.changeTool(toolType);
            }
        });

        var optionsService = new OptionsService(settings);
        var tpApi = new TPApi(optionsService);

        if (!optionsService.getDomain()) {
            showOptions(optionsService, tpApi);
        }
        else {
            tpApi
                .auth()
                .fail(function() {
                    // navigate to options
                    showOptions(optionsService, tpApi);
                })
                .done(function() {
                    // setupPostParameters(optionsService, tpApi, fabricCanvas);
                });
        }
    });
});