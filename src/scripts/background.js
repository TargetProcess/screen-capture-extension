/*globals chrome, Q, Promise */
/*eslint quotes:[0, "single"], no-global-strict: 0 */

'use strict';

var getImageData = function() {
    return new Promise(function(resolve) {
        chrome
            .tabs
            .captureVisibleTab(null, resolve);
    });
};

var openEditorTab = function() {

    var url = chrome.extension.getURL('editor.html?id=' + Number(new Date()));
    return new Promise(function(resolve) {
        chrome
            .tabs
            .create({
                url: url
            }, resolve);
    });
};

var openImageInEditor = function(imageData, editorTab) {

    chrome
        .tabs
        .onUpdated
        .addListener(function waitComplete(tabId, changedProps) {

            if (tabId === editorTab.id || changedProps.status === 'complete') {

                chrome.tabs.onUpdated.removeListener(waitComplete);

                var views = chrome.extension.getViews();
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    if (view.location.href === editorTab.url) {
                        view.screenshotUrl = imageData;
                        break;
                    }
                }
            }
        });

};

var takeScreenshot = function() {

    Promise
        .all([getImageData(), openEditorTab()])
        .then(function(values) {
            openImageInEditor(values[0], values[1]);
        });
};

// Listen for a click on the camera icon. On that click, take a screenshot
chrome
    .browserAction
    .onClicked
    .addListener(takeScreenshot);

// Listen for a shortcut. On match - take a screenshot
// chrome
//     .extension
//     .onRequest
//     .addListener(function(r) {
//         if (r.message === 'shortcut-is-fired') {
//             var KEY_Z = 90;
//             if (r.code === KEY_Z) {
//                 takeScreenshot();
//             }
//         }
//     });
