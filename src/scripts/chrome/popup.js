/*globals chrome */
(function() {
    'use strict';

    var links = Array.prototype.slice.call(document.querySelectorAll('a'));

    chrome.tabs.query({
        active: true
    }, function(tabs) {
        if (tabs[0].url.match(/^chrome(-extension)?:\/\//)) {
            links[0].classList.add('disabled');
            links[0].parentNode.classList.add('disabled');
        }
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
