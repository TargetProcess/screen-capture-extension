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

    ChromeApi.getCurrentTab().done(function(tab) {

        var $box = $('#box');
        var $btn = $('.i-role-trigger-take');
        $btn.on('click', function() {

            $box.removeClass('take-screenshot');

            ChromeApi
                .captureTab()
                .fail(function() {
                    alert('capturing is failed');
                })
                .done(function(base64str) {

                    var $postTrigger = $('.i-role-trigger-post');
                    $postTrigger.prop('disabled', true);

                    tpApi
                        .fetchProjects()
                        .done(function(r) {
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

                    $postTrigger.one('click', function() {
                        var description = '<p>test</p>';

                        tpApi
                            .postBugToTargetProcess(
                                $('.i-role-projects').val(),
                                $text.val(),
                                description,
                                base64str
                            )
                            .done(function() {
                                $box.removeClass('post-screenshot')
                                    .addClass('take-screenshot');
                            });
                    });
                });
        });
    });
});
