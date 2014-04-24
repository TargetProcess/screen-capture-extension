define(['Class'], function(Class){


    var Tool = Class.extend({


        enable: function(options, canvas) {
            this.fabricCanvas = canvas;
            canvas.isDrawingMode = true;
            // this.fabricCanvas.isDrawingMode = true;
            this.fabricCanvas.freeDrawingBrush.width = options.width;
            this.fabricCanvas.freeDrawingBrush.color = options.color;
        },

        disable: function() {
            this.fabricCanvas.isDrawingMode = false;
            // this.saveState();
        }
    });

    return React.createClass({

        select: function() {
            this.props.paintManager.selectTool('pencil');
        },

        componentDidMount: function() {
            this.props.paintManager.registerTool('pencil', new Tool());
        },

        render: function(){

            return (
                <li className={"tools__item tools__item-pencil " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-pencil"></i>
                    </button>
                </li>
            );
        }
    });
});
