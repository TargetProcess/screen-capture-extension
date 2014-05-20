define(['./draw-tool', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        start: function(e) {

            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Circle({
                id: _.uniqueId('figure'),
                left: e.offsetX,
                top: e.offsetY,
                fill: false,
                stroke: this.options.color,
                strokeWidth: this.options.width,
                shadow: this.options.shadow,
                selectable: false
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.renderAll();
        },

        move: function(e) {

            this.figure.set({
                radius: Math.abs(e.offsetX - this.x0) / 2
            });
            this.figure.setCoords(); // for selection
            this.fabricCanvas.renderAll();
        },

        stop: function() {

            if (this.figure.radius) {
                this.saveState();
            } else {
                this.fabricCanvas.remove(this.figure);
            }
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'circle',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
