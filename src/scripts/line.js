define(['./draw-tool', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        start: function(e) {
            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Line(null, {
                left: e.offsetX,
                top: e.offsetY,
                stroke: this.options.color,
                strokeWidth: this.options.width,
                strokeLineCap: 'round',
                shadow: this.options.shadow,
                selectable: false
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.renderAll();
        },

        move: function(e) {

            var x1 = this.x0;
            var y1 = this.y0;
            var x2 = e.offsetX;
            var y2 = e.offsetY;

            var angleRadian = Math.atan((y2 - y1) / (x2 - x1));
            var angleDegree = angleRadian / Math.PI * 180;

            var hypotenuse = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            var k = (x2 >= x1) ? 1 : -1;

            this.figure.set({
                angle: angleDegree,
                width: k * hypotenuse
            });

            this.figure.setCoords();
            this.fabricCanvas.renderAll();
        },

        stop: function() {

            if (this.figure && this.figure.width) {
                this.saveState();
            }
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'line',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
