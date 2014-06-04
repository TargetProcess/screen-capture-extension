/*globals chrome, Promise */
define(function() {

    'use strict';

    var isChrome = Boolean(chrome);
    var chromeStorage = isChrome ? chrome.storage : null;

    return {
        set: function(key, val, type) {
            type = type || 'sync';
            return new Promise(function(resolve) {
                if (isChrome) {
                    var obj = {};
                    obj[key] = val;
                    chromeStorage[type].set(obj, resolve);
                } else {
                    resolve(localStorage.setItem(key, val));
                }
            });
        },

        get: function(key, type) {
            type = type || 'sync';
            return new Promise(function(resolve) {
                if (isChrome) {
                    chromeStorage[type].get(key, function(val) {
                        resolve(val[key]);
                    });
                } else {
                    resolve(localStorage.getItem(key));
                }
            });
        }
    };
});
