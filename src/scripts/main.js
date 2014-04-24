/*globals React */
require.config({
    baseUrl: './scripts/',
    paths: {
        'Class': 'libs/class'
    }
});

require(['editor'], function(Editor) {
    'use strict';
    React.renderComponent(Editor(), $('.editor')[0]);
});
