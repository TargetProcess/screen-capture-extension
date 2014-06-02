/*globals React */
require.config({
    baseUrl: './scripts/',
    paths: {
        'Class': 'libs/class'
    }
});

require(['editor'], function(Editor) {
    'use strict';
    React.renderComponent(Editor(), document.querySelector('.main'));
});

/*eslint-disable */
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-51208652-1']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
