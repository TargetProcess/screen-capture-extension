require([
    '/scripts/targetprocess.api.js'
    , '/scripts/options.api.js'
], function(TPApi, OptionsService) {


    var optionsService = new OptionsService(settings);
    var tpApi = new TPApi(optionsService);


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


});