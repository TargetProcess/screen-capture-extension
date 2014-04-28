define(['Class'], function(Class){

    var Tool = Class.extend({

        enable: function(options, fabricCanvas) {
            this.fabricCanvas = fabricCanvas;
            this.options = options;

            this.isJustStarted = true;
            this.isEditMode = false;
            this.completedWithoutMouse = false;

            $(document).on('keydown.text', function(e) {

                if (e.ctrlKey && e.which === 13) {
                    if (this.isEditMode) {
                        this.onPressEnter();
                    }
                    this.isEditMode = false;
                    this.completedWithoutMouse = true;
                }

            }.bind(this));

            this.subscriptions = {

                'custom:mousedown': function() {

                    if (this.isJustStarted) {
                        this.isJustStarted = false;
                        return;
                    }

                    if (this.completedWithoutMouse === true) {
                        this.completedWithoutMouse = false;
                        this.isEditMode = false;
                    } else {
                        this.completedWithoutMouse = true;
                        this.isEditMode = true;
                    }

                }.bind(this),

                'custom:mouseup': function(e) {

                    if (this.isEditMode) {

                        this.onCompleteEnter(e);
                    } else {

                        this.onStartEnter(e);
                    }

                }.bind(this),

                'custom:selected': function() {

                    this.isEditMode = true;

                }.bind(this),

                'custom:selection-cleared': function() {

                    this.isEditMode = false;

                }.bind(this)

            };

            this.fabricCanvas.on(this.subscriptions);
        },

        disable: function() {
            $(document).off('.text');
            this.fabricCanvas.off(this.subscriptions);
        },

        onPressEnter: function() {

            this.fabricCanvas.trigger('before:selection:cleared', {
                target: this.figure
            });

            this.fabricCanvas.discardActiveObject();
        },

        onStartEnter: function(e) {

            this.isEditMode = true;

            var DEFAULT_TEXT = '...';

            this.figure = new fabric.IText(DEFAULT_TEXT, {
                fontSize: 28,
                fontFamily: 'Lucida Grande, sans-serif',
                fontWeight: 'normal',
                left: e.offsetX,
                top: e.offsetY,
                lineHeight: 1.5,
                // fill: this.options.color,
                // stroke: '#ffffff',
                fill: this.options.color,
                strokeWidth: this.options.width,
                selectionStart: 0,
                selectionEnd: 3,
                // backgroundColor: 'rgba(74, 74, 74, .9)',
                // padding: 15

            });


            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.setActiveObject(this.figure);

            this.figure.enterEditing();
            this.figure.initDelayedCursor();

            this.fabricCanvas.renderAll();
        },

        onCompleteEnter: function() {

            this.isEditMode = false;

            this.saveState(this.figure);

        }
    });


    return React.createClass({

        componentDidMount: function() {
            this.props.paintManager.registerTool('text', new Tool());
        },

        select: function() {
            this.props.paintManager.selectTool('text');
        },

        render: function(){

            return (
                <li className={"tools__item tools__item-text " + this.props.className}>
                    <button className="tools__trigger" onClick={this.select}>
                        <i className="icon icon-text"></i>
                    </button>
                </li>
            );
        }
    });
});
