define(['./draw-tool'], function(Class) {

    var Tool = Class.extend({

        start: function(e) {
            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Line(null, {
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
            var k = (x2 >= x1) ? 1 : -1;

            this.figure.set({
                angle: angleDegree,
                width: k * hypotenuse
            });
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('line', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('line');
        },


        render: function() {

            return (
                <li className={"tools__item tools__item-line " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-line"></i>
                    </button>
                </li>
            );
        }
    });
});
