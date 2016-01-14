/*globals chrome */
(function() {
    'use strict';

    var links = Array.prototype.slice.call(document.querySelectorAll('a'));

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {

        var currentTab = tabs[0];

        links[0].classList.add('disabled');
        links[0].parentNode.classList.add('disabled');

        chrome.tabs.executeScript(currentTab.id, {
            code: 'document.createElement("div").style'
        }, function(res) {

            if (res && res[0]) {

                links[0].classList.remove('disabled');
                links[0].parentNode.classList.remove('disabled');

            }

        });

    });

    var linkListener = function(button) {

        if (!button.classList.contains('disabled')) {
            button.addEventListener('click', function(e) {
                e.currentTarget.parentNode.classList.add('active');
                chrome.runtime.sendMessage({
                    action: e.currentTarget.dataset.action
                });
            });
        }
    };

    links.forEach(linkListener);

}());
