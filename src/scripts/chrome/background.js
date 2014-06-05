/*globals chrome, Promise */
(function() {
    'use strict';

    var selection = null;

    var isEditorTab = function(tab) {
        return (tab.title === 'Targetprocess Screen Capture' && tab.url.match(/^chrome-extension:\/\//));
    };

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

                if (editorTab && tabId === editorTab.id && changedProps.status === 'loading') {

                    chrome.tabs.onUpdated.removeListener(waitComplete);

                    var view = chrome.extension.getViews().filter(function(view) {
                        return view.location.href === editorTab.url;
                    })[0];

                    if (view) {
                        view.screenshotUrl = imageData;
                        view.screenshotSelection = selection;
                    }
                    selection = null;
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

    var takeScreenshot = function(tab) {

        if (!isEditorTab(tab)) {
            Promise
                .cast(getImageData())
                .then(function(imageData) {
                    openImageInEditor(imageData);
                });
        }
    };

    var initSelection = function(tab) {

        chrome.tabs.sendMessage(tab.id, {
            action: 'captureSelection:start'
        });
    };

    chrome.runtime.onMessage.addListener(function(request, sender) {

        switch (request.action) {
            case 'captureVisible:selected':
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    takeScreenshot(tabs[0]);
                });

                break;

            case 'captureSelection:selected':
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function(tabs) {
                    initSelection(tabs[0]);
                });
                break;

            case 'captureSelection:completed':
                selection = request.selection;
                takeScreenshot(sender.tab);
                break;

        }
    });

    var toggleAction = function(tabId) {
        chrome.tabs.get(tabId, function(tab) {
            if (tab) {
                if (isEditorTab(tab)) {
                    chrome.browserAction.disable();
                } else {
                    chrome.browserAction.enable();
                }
            }
        });
    };

    chrome
        .tabs
        .onUpdated
        .addListener(function(tabId) {
            return toggleAction(tabId);
        });

    chrome
        .tabs
        .onActivated
        .addListener(function(info) {
            return toggleAction(info.tabId);
        });

    chrome.windows.onFocusChanged.addListener(function() {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            toggleAction(tabs[0].id);
        });
    });

}());
