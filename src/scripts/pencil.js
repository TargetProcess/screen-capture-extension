define(['Class', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        enable: function(options, canvas) {

            this.fabricCanvas = canvas;
            canvas.isDrawingMode = true;
            this.fabricCanvas.freeDrawingBrush.width = options.width;
            this.fabricCanvas.freeDrawingBrush.color = options.color;

            this.options = options;

            this.listener = this.stop.bind(this);
            canvas.on('path:created', this.listener);
        },

        disable: function() {

            this.fabricCanvas.isDrawingMode = false;
            this.fabricCanvas.off('path:created', this.listener);
        },

        stop: function(e) {

            e.path.selectable = false;
            e.path.setShadow(this.options.shadow);
            this.getState = function() {
                return e.path;
            };
            this.saveState();
            this.fabricCanvas.renderAll();
        },

        undo: function(state) {

            this.fabricCanvas.remove(state);
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'pencil',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });

});
