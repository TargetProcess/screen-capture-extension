define([], function() {

    function UI() {

        this.Disable = function(buttonType) {
            var $button = $(".i-role-editor .button." + buttonType);
            $button.addClass("disabled");
        };

        this.Enable = function(buttonType) {
            var $button = $(".i-role-editor .button." + buttonType);
            $button.removeClass("disabled");
        };
    }

    return UI;
});
