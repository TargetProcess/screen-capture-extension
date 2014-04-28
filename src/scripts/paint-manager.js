define([
    'Class'
], function(Class) {

    'use strict';

    return Class.extend({

        init: function(options) {

            this.states = [];

            this.tools = {};
            this.options = options;

            this.selectedTool = null;
        },

        start: function(canvasId, url) {
            return Q
                .when(this.initCanvas(canvasId))
                .then(this.setImageAsBackground.bind(this, url))
                .then(function() {
                    this.initEvents();

                    this.initialState = this.canvas.toDataURL();
                    this.currentState = this.initialState;
                }.bind(this));
        },

        registerTool: function(name, tool) {
            this.tools[name] = tool;
        },

        saveState: function() {

            var nextState = this.canvas.toDataURL();

            if (this.currentState) {
                this.states.push({state: this.currentState, tool: this.selectedTool});
            }
            this.currentState = nextState;
        },

        undo: function() {

            var state = this.states.pop();
            state = state ? state.state : this.initialState;

            this.currentState = null;

            this.canvas.clear();
            fabric.Image.fromURL(state, function(img) {
                this.canvas.setDimensions({
                    width: img.width,
                    height: img.height
                });
                this.canvas.setBackgroundImage(img);
                this.canvas.renderAll();
            }.bind(this));
        },

        onToolSelected: function(f) {
            this.cb = f;
        },

        selectTool: function(name) {

            if (this.selectedTool) {
                this.tools[this.selectedTool].disable();
            }

            this.selectedTool = name;
            if (this.tools[this.selectedTool]) {
                this.tools[this.selectedTool].enable(this.options, this.canvas);
                this.tools[this.selectedTool].saveState = this.saveState.bind(this);
                this.cb(this.selectedTool);
            }
        },

        initEvents: function() {

            var selectionActivated = false;
            var isDrawMode = false;
            var canvas = this.canvas;
            var canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect();

            $(document).on('keydown', function(e) {
                if (e.keyCode === 90 && e.metaKey) {
                    this.undo();
                }
            }.bind(this));

            this.canvas.on({
                'object:selected': function(e) {
                    selectionActivated = true;
                    this.trigger('custom:selected', e);
                },
                'before:selection:cleared': function(e) {
                    selectionActivated = false;
                    this.trigger('custom:unselected', e);
                },
                'selection:cleared': function(e) {
                    selectionActivated = false;
                    this.trigger('custom:selection-cleared', e);
                },
                'mouse:down': function(evt) {
                    canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
                    if (!selectionActivated) {
                        isDrawMode = true;
                        this.trigger('custom:mousedown', evt.e);
                    }
                },
                'mouse:move': function(evt) {
                    if (isDrawMode) {
                        var e = evt.e;
                        e = {
                            offsetX: e.clientX - canvasRect.left,
                            offsetY: e.clientY - canvasRect.top
                        };
                        this.trigger('custom:mousemove', e);
                    }
                },
                'mouse:up': function(evt) {
                    if (isDrawMode) {
                        this.trigger('custom:mouseup', evt.e);
                        isDrawMode = false;
                    }
                }
            });
        },

        setColor: function(value) {
            this.options.color = value;
            this.selectTool(this.selectedTool);
        },

        setImageAsBackground: function(url) {

            var defer = Q.defer();

            fabric.Image.fromURL(url, function(img) {

                var w = img.getWidth();
                var h = img.getHeight();

                var dpxRatio = window.devicePixelRatio;

                var xw = w / dpxRatio;
                var xh = h / dpxRatio;

                img.setWidth(xw);
                img.setHeight(xh);

                this.canvas.setDimensions({
                    width: img.getWidth(),
                    height: img.getHeight()
                });

                this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas));
                defer.resolve(this.canvas);
            }.bind(this));

            return defer.promise;
        },

        initCanvas: function(id) {

            this.canvas = new fabric.Canvas(id, {
                selection: false,
                skipTargetFind: true,
                perPixelTargetFind: true,
                targetFindTolerance: 5
            });

            return this.canvas;
        }
    });
});
