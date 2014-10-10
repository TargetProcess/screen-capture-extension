/*globals chrome */

(function() {

    'use strict';

    var selection = {

        enabled: false,

        enable: function() {

            var isTouch = Boolean(window.DocumentTouch && document instanceof window.DocumentTouch);

            this.$cropEl = $('<div class="targetprocess-screen-capture"></div>').appendTo('body').css({
                position: 'fixed',
                width: '100%',
                background: 'transparent',
                top: 0,
                bottom: 0,
                zIndex: 9999
            });

            this.$cropEl.css('cursor', 'crosshair');

            this.$cropEl.imgAreaSelect({
                handles: true,
                zIndex: 9999,
                parent: this.$cropEl,
                onSelectEnd: function(img, selection) {

                    var rect = this.$cropEl[0].getBoundingClientRect();

                    selection.width = window.devicePixelRatio * selection.width;
                    selection.height = window.devicePixelRatio * selection.height;

                    selection.x1 = selection.x1 + rect.left;
                    selection.y1 = selection.y1 + rect.top;

                    this.rect = selection;
                    this.$cropEl.css('cursor', 'crosshair');
                    this.$cropHelper.tooltip('show');
                }.bind(this)
            });

            var text = isTouch ? 'Snap Area' : 'Double click or press Enter to crop, Esc to leave';
            var $tooltip = $('<span class="crop-tooltip"> ' + text + ' </span>');

            this.$cropHelper = $('.imgareaselect-selection').parent().addClass('imgareaselect-main');
            this.$cropHelper.tooltip({
                trigger: 'manual',
                html: true,
                title: $tooltip,
                viewport: this.$cropEl
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

            $(document).on('touchend.crop click.crop', '.crop-tooltip', this.onEnter.bind(this));

            this.enabled = true;
        },

        disable: function() {

            this.$cropEl.css('cursor', '');

            $(document).off('.crop');
            this.$cropEl.off('.crop');

            this.$cropHelper.tooltip('hide');
            this.$cropHelper.tooltip('destroy');

            this.$cropEl.imgAreaSelect({
                remove: true
            });
            this.$cropEl.remove();

            this.enabled = false;
        },

        onEnter: function() {
            this.$cropHelper.tooltip('hide');
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
            this.disable();
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
