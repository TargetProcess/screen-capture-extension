define(['Class', './button-tool'], function(Class, Button) {

    'use strict';

    var DEFAULT_TEXT = '...';

    var Tool = Class.extend({

        enable: function(options, canvas) {

            this.fabricCanvas = canvas;

            canvas.selection = true;
            canvas.forEachObject(function(o) {
                o.selectable = true;
            });

            this.subscriptions = {
                'object:selected': function(e) {
                    this.figure = e.target;
                }.bind(this),

                'object:modified': function() {
                    this.saveState();
                }.bind(this),

                'text:editing:entered': function(e) {
                    this.figure = e.target;
                }.bind(this),

                'text:editing:exited': function() {
                    this.blur();
                }.bind(this)
            };

            this.fabricCanvas.on(this.subscriptions);

            $(document).on('keydown.pencil', function(e) {
                if (e.which === 8 || e.which === 46) {
                    e.preventDefault();
                    this.fabricCanvas.discardActiveObject();
                    this.fabricCanvas.remove(this.figure);
                    this.saveState();
                    this.figure = null;
                }
            }.bind(this));
        },

        disable: function() {

            this.fabricCanvas.discardActiveObject();
            this.fabricCanvas.selection = false;
            this.fabricCanvas.forEachObject(function(o) {
                o.selectable = false;
            });

            this.fabricCanvas.off(this.subscriptions);
            $(document).off('.pencil');
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
                state: _.clone(obj.originalState)
            };
        },

        undo: function(state) {

            if (!_.find(this.fabricCanvas.getObjects(), state.object)) {
                this.fabricCanvas.add(state.object);
            }
            state.object.set(state.state);
            state.object.setCoords();
            this.fabricCanvas.renderAll();
        }
    });

    return React.createClass({

        render: function() {
            return Button({
                name: 'cursor',
                className: this.props.className,
                paintManager: this.props.paintManager,
                tool: new Tool()
            });
        }
    });
});
