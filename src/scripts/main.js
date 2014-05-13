/*globals React */
require.config({
    baseUrl: './scripts/',
    paths: {
        'Class': 'libs/class'
    }
});

require(['editor'], function(Editor) {
    'use strict';
    setTimeout(function() {
        React.renderComponent(Editor(), $('.main')[0]);
    }, 100);
});

window.setScreenshotUrl = function(url) {
    'use strict';
    window.screenshotUrl = url;
};
