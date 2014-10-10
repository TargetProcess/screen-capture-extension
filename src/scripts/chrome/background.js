/*globals chrome, Promise */
(function() {
    'use strict';

    var selection = null;
    var image = null;
    var lastTab = null;

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

        image = imageData;

        var url = chrome.extension.getURL('editor.html?id=' + Number(new Date()));

        chrome
            .tabs
            .create({
                url: url
            }, function(tab) {
                lastTab = tab;
            });
    };

    var takeScreenshot = function(tab) {

        if (!isEditorTab(tab)) {
            getImageData()
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

            case 'editor:ready':

                if (lastTab && image && sender.tab.id === lastTab.id) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'editor:startExternal',
                        image: image,
                        selection: selection
                    });

                    lastTab = null;
                    selection = null;
                    image = null;
                } else {
                    // F5 in editor
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: 'editor:startLocal'
                    });
                }
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
