define(['Class', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        enable: function(options, canvas) {

            this.fabricCanvas = canvas;
            canvas.selection = true;

            canvas.forEachObject(function(o) {
                o.selectable = true;
                // o.editable = true;
            });

            this.listener = this.start.bind(this);
            canvas.on('object:selected', this.listener);
            // canvas.on('object:modified', this.listener);
        },

        start: function() {
            this.saveState();
        },

        disable: function() {
            this.fabricCanvas.forEachObject(function(o) {
                o.selectable = false;
                // o.editable = false;
            });
            this.fabricCanvas.selection = false;
            this.fabricCanvas.discardActiveObject();
            this.fabricCanvas.off('mouse:down', this.listener);
        },

        getState: function() {
            var obj = this.fabricCanvas.getActiveObject();
            return {
                object: obj,
                left: obj.left,
                top: obj.top,
                width: obj.width,
                height: obj.height,
                angle: obj.angle
            };
        },

        undo: function(state) {
            state.object.set(state);
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'cursor',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
