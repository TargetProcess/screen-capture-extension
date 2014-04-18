/*globals chrome, Q */
/*eslint quotes:[0, "single"], no-global-strict: 0 */

'use strict';

var getImageData = function() {
    debugger;
    var defer = Q.defer();

    chrome
        .tabs
        .captureVisibleTab(null, defer.resolve());

    return defer.promise;
};

var openEditorTab = function() {
    debugger
    var url = chrome.extension.getURL('editor.html?id=' + Number(new Date()));
    var defer = Q.defer();
    chrome
        .tabs
        .create({
            url: url
        }, defer.resolve);

    return defer.promise;
};

var openImageInEditor = function(imageData, editorTab) {
    debugger
    chrome
        .tabs
        .onUpdated
        .addListener(function waitComplete(tabId, changedProps) {

            if (tabId === editorTab.id || changedProps.status === 'complete') {

                chrome.tabs.onUpdated.removeListener(waitComplete);

                var views = chrome.extension.getViews();
                for (var i = 0; i < views.length; i++) {
                    var view = views[i];
                    if (view.location.href === viewTabUrl) {
                        view.setScreenshotUrl(imageData);
                        break;
                    }
                }
            }
        });

};

var takeScreenshot = function() {

    Q
        .all([getImageData(), openEditorTab()])
        .spread(openImageInEditor);
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
