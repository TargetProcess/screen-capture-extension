/*globals chrome */

(function() {

    'use strict';

    var selection = {

        enabled: false,

        enable: function() {

            this.$cropEl = $('body');

            this.$cropEl.imgAreaSelect({
                handles: true,
                onSelectEnd: function(img, selection) {
                    this.rect = selection;
                }.bind(this)
            });

            $(document).on('keydown.crop', function(e) {
                if (e.which === 27) {
                    this.onEscape();
                }

                if (e.which === 13) {
                    this.onEnter();
                }
            }.bind(this));

            $(document).on('dblclick.crop', function(e) {
                if (e.target.className.match(/^imgareaselect/)) {
                    this.onEnter();
                }
            }.bind(this));

            this.enabled = true;
        },

        disable: function() {

            $(document).off('.crop');
            this.$cropEl.off('.crop');

            this.$cropEl.imgAreaSelect({
                remove: true
            });

            this.enabled = false;
        },

        onEnter: function() {

            if (!this.rect) {
                return;
            }

            var selection = this.rect;

            this.disable();

            setTimeout(function() {
                chrome.runtime.sendMessage({
                    action: 'captureSelection:completed',
                    selection: selection
                });
            }, 100);
        },

        onEscape: function() {
            this.$cropHelper.tooltip('hide');
            this.$cropEl.imgAreaSelect({
                hide: true
            });
            this.rect = null;
        }
    };

    chrome.runtime.onMessage.addListener(function(request) {
        if (request.action === 'captureSelection:start') {
            if (!selection.enabled) {
                selection.enable();
            }
        }
    });
}());
