define(['./draw-tool', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        start: function(e) {

            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Rect({
                left: e.offsetX,
                top: e.offsetY,
                stroke: this.options.color,
                strokeWidth: this.options.width,
                fill: false,
                selectable: false
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.renderAll();
        },

        move: function(e) {

            this.figure.set({
                width: e.offsetX - this.x0,
                height: e.offsetY - this.y0
            });
            this.figure.setCoords();
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'rect',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
