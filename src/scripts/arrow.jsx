define(['./draw-tool', 'libs/fabric/arrow'], function(Class) {

    var Tool = Class.extend({

        start: function(e) {
            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Arrow(null, {
                left: e.offsetX,
                top: e.offsetY,
                stroke: this.options.color,
                strokeWidth: this.options.width
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
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('arrow', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('arrow');
        },

        render: function(){

            return (
                <li className={"tools__item tools__item-arrow " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-arrow"></i>
                    </button>
                </li>
            );
        }
    });
});
