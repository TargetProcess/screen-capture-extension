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

            $(document).on('keydown.pencil', '.editor_area', function(e) {
                if (e.which === 8 || e.which === 46) {

                    e.preventDefault();
                    var objs = [];

                    if (this.figure.type === 'group') {
                        this.fabricCanvas.discardActiveGroup();
                        objs = this.figure.getObjects();
                    } else {
                        this.fabricCanvas.discardActiveObject();
                        objs = [this.figure];
                    }

                    this.saveState();
                    this.fabricCanvas.remove(this.figure);

                    objs.forEach(function(object) {
                        this.fabricCanvas.remove(object);
                    }.bind(this));

                    this.figure = null;
                    this.fabricCanvas.renderAll();
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

            var isGroup = (this.figure.type === 'group');
            var objs = isGroup ? this.figure.getObjects() : [this.figure];
            return objs.map(function(obj) {
                var res = {
                    object: obj,
                    state: _.clone(obj.originalState)
                };

                // set by hands, skip groups now
                if (!isGroup) {
                    obj.originalState = _.clone(obj);
                }
                return res;
            });
        },

        undo: function(states) {

            this.fabricCanvas.discardActiveGroup();
            this.fabricCanvas.renderAll();
            states.forEach(function(state) {
                if (!_.find(this.fabricCanvas.getObjects(), state.object)) {
                    this.fabricCanvas.add(state.object);
                }

                // groups bugs ?
                if (!state.state.width) {
                    delete state.state.width;
                }
                if (!state.state.height) {
                    delete state.state.height;
                }

                state.object.set(state.state);
                state.object.setCoords();

            }.bind(this));
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
