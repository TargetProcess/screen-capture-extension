define(['./draw-tool', './button-tool', './libs/fabric/arrow'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        start: function(e) {

            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Arrow(null, {
                left: e.offsetX,
                top: e.offsetY,
                stroke: this.options.color,
                strokeWidth: this.options.width,
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

            var r = (x2 >= x1);
            var l = !r;
            var b = (y2 >= y1);
            var t = !b;

            var sector = 0;
            if (b && r) {
                (sector = 0);
            }
            if (b && l) {
                (sector = -180);
            }
            if (t && l) {
                (sector = 180);
            }
            if (t && r) {
                (sector = -360);
            }

            this.figure.set({
                angle: angleDegree - sector,
                width: hypotenuse
            });

            this.figure.setCoords();
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'arrow',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
