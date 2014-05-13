/*globals chrome, Promise */
(function() {
    'use strict';

    var getImageData = function() {
        return new Promise(function(resolve) {
            chrome
                .tabs
                .captureVisibleTab(null, resolve);
        });
    };

    var openImageInEditor = function(imageData) {

        var editorTab = null;
        chrome
            .tabs
            .onUpdated
            .addListener(function waitComplete(tabId, changedProps) {

                if (editorTab && tabId === editorTab.id && changedProps.status === 'complete') {

                    chrome.tabs.onUpdated.removeListener(waitComplete);

                    var view = chrome.extension.getViews().filter(function(view) {
                        return view.location.href === editorTab.url;
                    })[0];

                    if (view) {
                        view.setScreenshotUrl(imageData);
                    }
                }
            });

        var url = chrome.extension.getURL('editor.html?id=' + Number(new Date()));

        chrome
            .tabs
            .create({
                url: url
            }, function(tab) {
                editorTab = tab;
            });
    };

    var takeScreenshot = function() {

        Promise
            .cast(getImageData())
            .then(function(imageData) {
                openImageInEditor(imageData);
            });
    };

    // Listen for a click on the camera icon. On that click, take a screenshot
    chrome
        .browserAction
        .onClicked
        .addListener(takeScreenshot);

}());
