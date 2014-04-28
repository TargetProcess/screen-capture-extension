define(['./draw-tool'], function(Class){

    var Tool = Class.extend({

        start: function(e) {
            this.x0 = e.offsetX;
            this.y0 = e.offsetY;

            this.figure = new fabric.Circle({
                left: e.offsetX,
                top: e.offsetY,
                fill: false,
                stroke: this.options.color,
                strokeWidth: this.options.width
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.renderAll();
        },

        move: function(e) {
            this.figure.set({
                radius: Math.abs(e.offsetX - this.x0) / 2,
                // height: e.offsetY - this.y0
            });
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('circle', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('circle');
        },

        render: function(){

            return (
                <li className={"tools__item tools__item-circle " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-circle"></i>
                    </button>
                </li>
            );
        }
    });
});