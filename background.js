var id = 100;

function takeScreenshot() {
    chrome
        .tabs
        .captureVisibleTab(null, function (base64) {
            var screenshotUrl = base64;
            var viewTabUrl = chrome.extension.getURL('screenshot.html?id=' + (++id));

            chrome
                .tabs
                .create({url: viewTabUrl}, function (tab) {

                    var addSnapshotImageToTab = function (view) {
                        view.setScreenshotUrl(screenshotUrl);
                    };

                    var targetId = tab.id;
                    chrome
                        .tabs
                        .onUpdated
                        .addListener(function WaitForScreenshotTab(tabId, changedProps) {

                            if (tabId != targetId || changedProps.status != "complete")
                                return;

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
}

// Listen for a click on the camera icon.  On that click, take a screenshot.
chrome
    .browserAction
    .onClicked
    .addListener(takeScreenshot);
