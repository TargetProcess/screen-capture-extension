define(['./draw-tool'], function(Class){

    var Tool = Class.extend({

        name: 'rect',

        start: function(e) {
            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Rect({
                left: e.offsetX,
                top: e.offsetY,
                stroke: this.options.color,
                strokeWidth: this.options.width,
                fill: 'rgba(0, 0, 0, 0)',
                width: 1,
                height: 1
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.renderAll();
        },

        move: function(e) {
            this.figure.set({
                width: e.offsetX - this.x0,
                height: e.offsetY - this.y0
            });
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('rect', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('rect');
        },

        render: function() {

            return (
                <li className={"tools__item tools__item-rect " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-rect"></i>
                    </button>
                </li>
            );
        }
    });
});
