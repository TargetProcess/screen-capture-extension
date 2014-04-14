/*globals chrome */
/*eslint quotes:[0, "single"], no-global-strict: 0 */

'use strict';
var takeScreenshot = function() {

    chrome
        .tabs
        .captureVisibleTab(null, function(base64) {
            var screenshotUrl = base64;
            var viewTabUrl = chrome.extension.getURL('dist/editor.html?id=' + Number(new Date()));

            chrome
                .tabs
                .create({
                    url: viewTabUrl
                }, function(tab) {

                    var addSnapshotImageToTab = function(view) {
                        view.setScreenshotUrl(screenshotUrl);
                    };

                    var targetId = tab.id;
                    chrome
                        .tabs
                        .onUpdated
                        .addListener(function WaitForScreenshotTab(tabId, changedProps) {

                            if (tabId !== targetId || changedProps.status !== 'complete') {
                                return;
                            }

                            chrome.tabs.onUpdated.removeListener(WaitForScreenshotTab);

                            var views = chrome.extension.getViews();
                            for (var i = 0; i < views.length; i++) {
                                var view = views[i];
                                if (view.location.href === viewTabUrl) {

                                    addSnapshotImageToTab(view);

                                    break;
                                }
                            }
                        });
                });
        });
};

// Listen for a click on the camera icon. On that click, take a screenshot
chrome
    .browserAction
    .onClicked
    .addListener(takeScreenshot);

// Listen for a shortcut. On match - take a screenshot
chrome
    .extension
    .onRequest
    .addListener(function(r) {
        if (r.message === 'shortcut-is-fired') {
            var KEY_Z = 90;
            if (r.code === KEY_Z) {
                takeScreenshot();
            }
        }
    });
