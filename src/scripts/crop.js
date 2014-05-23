define(['Class', './button-tool'], function(Class, Button) {
    'use strict';

    var Tool = Class.extend({

        enable: function(options, fabricCanvas) {

            this.options = options;
            this.fabricCanvas = fabricCanvas;

            this.$cropEl = $(this.fabricCanvas.upperCanvasEl);

            this.rect = null;

            this.$cropEl.imgAreaSelect({
                handles: true,
                onSelectEnd: function(img, selection) {
                    this.rect = selection;
                    this.$cropHelper.tooltip('show');
                }.bind(this)
            });

            this.$cropHelper = $('.imgareaselect-selection').parent();
            this.$cropHelper.tooltip({
                trigger: 'manual',
                title: 'Double click or press Enter to crop, Esc to leave'
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
        },

        disable: function() {
            $(document).off('.crop');
            this.$cropEl.off('.crop');
            this.$cropHelper.tooltip('hide');
            this.$cropHelper.tooltip('destroy');

            this.$cropEl.imgAreaSelect({
                remove: true
            });
        },

        onEnter: function() {
            this.$cropHelper.tooltip('hide');
            if (!this.rect) {
                return;
            }

            var r = this.rect;

            this.$cropEl.imgAreaSelect({
                hide: true
            });

            var dim = {
                left: r.x1,
                top: r.y1,
                width: r.width,
                height: r.height
            };

            this.getState = function() {

                return {
                    left: dim.left,
                    top: dim.top,
                    width: this.fabricCanvas.width,
                    height: this.fabricCanvas.height
                };
            };

            this.saveState();

            this.fabricCanvas.setDimensionsCorrect({
                width: dim.width,
                height: dim.height
            });

            this.fabricCanvas.forEachObject(function(o) {
                o.left = o.left - dim.left;
                o.top = o.top - dim.top;
                o.setCoords();
            });

            this.fabricCanvas.renderAll();
            this.rect = null;
        },

        onEscape: function() {
            this.$cropHelper.tooltip('hide');
            this.$cropEl.imgAreaSelect({
                hide: true
            });
            this.rect = null;
        },

        getState: function() {

            return {
                left: this.fabricCanvas.backgroundImage.left,
                top: this.fabricCanvas.backgroundImage.top,
                height: this.fabricCanvas.backgroundImage.height,
                width: this.fabricCanvas.backgroundImage.width
            };
        },

        undo: function(state) {

            this.fabricCanvas.setDimensionsCorrect({
                width: state.width,
                height: state.height
            });

            this.fabricCanvas.forEachObject(function(o) {
                o.left = o.left + state.left;
                o.top = o.top + state.top;
                o.setCoords();
            });
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'crop',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
