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

                    var view = chrome.extension.getViews().filter(function(view) {
                        return view.location.href === editorTab.url;
                    })[0];

                    view.screenshotUrl = imageData;
                }
            });
    };

    var shortcutListener = function() {

        if (window === top) {
            window.addEventListener('keyup', function(e) {
                if (e.ctrlKey && e.shiftKey && e.keyCode) {
                    chrome
                        .extension
                        .sendRequest({
                            message: 'shortcut-is-fired',
                            code: e.keyCode
                        });
                }
            }, false);
        }
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

    shortcutListener();
}());
