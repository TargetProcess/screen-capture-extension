define(['./draw-tool', './button-tool'], function(Class, Button) {

    'use strict';

    var DEFAULT_TEXT = '...';

    var Tool = Class.extend({

        enable: function(options, fabricCanvas) {

            this.fabricCanvas = fabricCanvas;
            this.options = options;

            var isBlur = false;
            this.subscriptions = {

                'object:modified': function(e) {
                    isBlur = true;
                    this.saveState(e);
                }.bind(this),

                'text:editing:entered': function(e) {
                    this.figure = e.target;
                }.bind(this),

                'text:editing:exited': function() {
                    isBlur = true;
                    this.blur();
                }.bind(this),

                'custom:mousedown': function(e) {
                    if (isBlur) {
                        isBlur = false;
                        return;
                    }
                    this.start(e);
                }.bind(this)
            };

            this.fabricCanvas.on(this.subscriptions);
        },

        disable: function() {

            this.fabricCanvas.forEachObject(function(o) {
                o.selectable = false;
            });
            this.fabricCanvas.selection = false;
            this.fabricCanvas.discardActiveObject();

            this.fabricCanvas.off(this.subscriptions);
        },

        start: function(e) {

            this.figure = new fabric.IText(DEFAULT_TEXT, {
                fontSize: 28,
                fontFamily: '"Open Sans", sans-serif',
                fontWeight: 'normal',
                left: e.offsetX,
                top: e.offsetY,
                lineHeight: 1.3,
                fill: this.options.color,
                strokeWidth: this.options.width,
                selectionStart: 0,
                selectionEnd: 3,
                selectable: false,
                editable: true,
                textBackgroundColor: 'rgba(0,0,0,0.5)'
            });

            this.fabricCanvas.add(this.figure);
            this.fabricCanvas.setActiveObject(this.figure);

            this.figure.enterEditing();
            this.figure.initDelayedCursor();

            this.figure.setCoords();
            this.fabricCanvas.renderAll();
        },

        blur: function() {

            var figure = this.figure;
            if (!figure.text ||
                (figure.originalState.text === DEFAULT_TEXT && figure.text === figure.originalState.text)) {

                this.fabricCanvas.remove(figure);
            } else {
                this.saveState();
            }
        },

        getState: function() {

            var obj = this.figure;
            return {
                object: obj,
                state: obj.originalState.text === DEFAULT_TEXT ? 'initial' : _.clone(obj.originalState)
            };
        },

        undo: function(state) {
            if (state.state === 'initial') {
                this.fabricCanvas.remove(state.object);

            } else {
                state.object.set(state.state);
                state.object.setCoords();

            }
            this.fabricCanvas.renderAll();
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
