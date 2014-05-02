define(['./draw-tool', './button-tool'], function(Class, Button) {

    'use strict';

    var Tool = Class.extend({

        enable: function(options, fabricCanvas) {
            this.fabricCanvas = fabricCanvas;
            this.options = options;

            this.isJustStarted = true;
            this.isEditMode = false;
            this.completedWithoutMouse = false;

            $(document).on('keydown.text', function(e) {
                if (e.metaKey && e.which === 13) {
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
                lineHeight: 1,
                fill: this.options.color,
                strokeWidth: this.options.width,
                selectionStart: 0,
                selectionEnd: 3,
                selectable: false,
                editable: true
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.setActiveObject(this.figure);

            this.figure.enterEditing();
            this.figure.initDelayedCursor();

            this.figure.setCoords();
            this.fabricCanvas.renderAll();
        },

        onCompleteEnter: function() {

            this.isEditMode = false;
            this.figure.exitEditing();
            // this.figure.set({
            //     editable: false,
            //     selectable: false
            // });

            this.figure.setCoords();
            this.fabricCanvas.renderAll();
            this.saveState();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'text',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
