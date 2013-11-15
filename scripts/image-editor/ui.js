define([], function() {

    function UI() {

        this.Disable = function (buttonType) {
            var $button = $("#editor .toolbar .button." + buttonType);

            if (!$button.hasClass("disabled")) {
                $button.addClass("disabled");
            }
        };

        this.Enable = function (buttonType) {
            var $button = $("#editor .toolbar .button." + buttonType);
            $button.removeClass("disabled");
        };

        this.AllowSubmit = function () {
            var $button = $(".submitButton");
            $button.removeClass("disabled");
        };

        this.ButtonFlash = function () {
            var $button = $(".submitButton");
            $button.addClass("clicked");

            setTimeout(function () {
                var $button = $(".submitButton");
                $button.removeClass("clicked");
            }, 200);
        };


        this.timeoutObject = undefined;

        this.ConsoleWrite = function (text) {

            $("#console").html($("#console").html() + text.replace(new RegExp("\r\n", 'g'), "<br>"));

            /////////////////////         Scroll Bottom       ///////////////////////////
            var elm = document.getElementById("console");
            try
            {
                elm.scrollTop = elm.scrollHeight;
            }
            catch(e)
            {
                var f = document.createElement("input");
                if (f.setAttribute) f.setAttribute("type","text")
                if (elm.appendChild) elm.appendChild(f);
                f.style.width = "0px";
                f.style.height = "0px";
                if (f.focus) f.focus();
                if (elm.removeChild) elm.removeChild(f);
            }
            //////////////////////////////////////////////////////////////////////////////
        }
    }

    return UI;

});