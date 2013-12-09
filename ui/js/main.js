// custom selects
(function ($) {
    $(document).ready( function () {
        $('#project, #severity, #business').fancySelect();
    });
})(jQuery);

// init colorpicker
(function ($) {
    $(document).ready( function () {
        $("#custom-color").spectrum({
            color: "#fba617",
            showPalette: true,
            showPaletteOnly: true,
            maxPaletteSize: 6,
            preferredFormat: "hex",
            palette: [
                ["rgb(255, 255, 255)", "rgb(251, 166, 23)", "rgb(121, 207, 24)", "rgb(215, 30, 19)", "rgb(56, 146, 227)", "rgb(0, 0, 0)"]
            ]
//            ,
//            show: function() {
//                var indent = ( $('.sp-replacer').outerWidth() / 2 ) - ( $('.sp-container').outerWidth() / 2 );
//                $('.sp-container').css( { 'margin-left' : indent, 'margin-top': '5px' } );
//            },
//            hide: function() {
//                $('.sp-container').css( { 'margin-left' : 0, 'margin-top': 0 } );
//            },
//            move: function() {
//                var indent = ( $('.sp-replacer').outerWidth() / 2 ) - ( $('.sp-container').outerWidth() / 2 );
//                $('.sp-container').css( { 'margin-left' : indent, 'margin-top': '5px' } );
//            }
        });

//        $('.sp-container').css('margin-left', '-60px');
    });
})(jQuery);

// init placeholder
(function ($) {
    $(document).ready( function () {
        $('input[placeholder], textarea[placeholder]').placeholder();
    });
})(jQuery);







