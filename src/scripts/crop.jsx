define(['Class'], function(Class){

    var canvas = function(r) {
        var c = document.createElement('CANVAS');
        c.width = r.width;
        c.height = r.height;
        return c;
    };


    var Tool = Class.extend({

        name: 'crop',

        enable: function(options, fabricCanvas) {

            this.options = options;
            this.fabricCanvas = fabricCanvas;

            this.rect = {};

            $(this.layer()).imgAreaSelect({
                handles: true,
                onSelectEnd: function(img, selection) {
                    this.rect = selection;
                }.bind(this)
            });

            $(document).on('keydown.crop', function(e) {
                if (e.which === 27) {
                    this.onEscape();
                }

                if (e.which === 13) {
                    this.onEnter();
                }
            }.bind(this));

            $(document).on('dblclick.crop', function(e) {
                if (e.target.className.match(/^imgareaselect/)) {
                   this.onEnter();
                }
            }.bind(this));
        },

        disable: function() {
            $(document).off('.crop');
            $(this.layer()).off('.crop');
            $(this.layer()).imgAreaSelect({
                remove: true
            });
        },

        layer: function() {
            return this.fabricCanvas.upperCanvasEl;
        },

        // createToolTip: function() {
        //     var $tooltip = $('.i-role-img-area-select-box-tooltip');
        //     if (!$tooltip.length) {
        //         $tooltip = $('<div><a class="i-role-action-crop" style="color:white;" href="#">crop</a></div>');
        //         $tooltip
        //             .addClass('i-role-img-area-select-box-tooltip')
        //             .css({
        //                 width: '50px',
        //                 height: '25px',
        //                 'background-color': 'rgba(0,25,0, 0.25)',
        //                 left: '1px',
        //                 top: '1px',
        //                 position: 'absolute',
        //                 'text-align': 'center',
        //                 color: 'white',
        //                 'border-radius': '5px'
        //             });

        //         $tooltip.on('click', '.i-role-action-crop', this.onEnter.bind(this));
        //         $('.i-role-img-area-select-box').append($tooltip);
        //     }
        // },

        // removeToolTip: function() {
        //     $('.i-role-img-area-select-box-tooltip').remove();
        // },

        onEnter: function() {
            var r = this.rect;

            // this.removeToolTip();
            $(this.layer()).imgAreaSelect({
                hide: true
            });



            var b64Image = this.fabricCanvas.toDataURL({
                left: r.x1,
                top: r.y1,
                width: r.width,
                height: r.height
            });
            fabric.Image.fromURL(b64Image, function(img) {

                    this.fabricCanvas.clear();
                    this.fabricCanvas.setDimensions(r);
                    this.fabricCanvas.setBackgroundImage(img, function() {
                        this.fabricCanvas.renderAll();
                        this.saveState();
                    }.bind(this));




            }.bind(this));
        },

        onEscape: function() {
            $(this.layer()).imgAreaSelect({
                hide: true
            });
        }
    });

    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('crop', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('crop');
        },
        render: function(){

            return (
                <li className={"tools__item tools__item-crop " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-crop"></i>
                    </button>
                </li>
            );
        }
    });
});
