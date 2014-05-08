define(['Class'], function(Class) {

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
                .then(this.initEvents.bind(this));
        },

        initCanvas: function(id) {

            this.canvas = new fabric.Canvas(id, {
                selection: false,
                perPixelTargetFind: true,
                targetFindTolerance: 5
            });
        },

        setImageAsBackground: function(url) {

            return Q
                .when(this.loadImage(url))
                .then(function(img) {

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
                }.bind(this));
        },

        loadImage: function(url) {

            var defer = Q.defer();
            fabric.Image.fromURL(url, function(img) {
                defer.resolve(img);
            });
            return defer.promise;
        },

        initEvents: function() {

            var isDrawMode = false;
            var selectionActivated = false;

            var canvas = this.canvas;
            var canvasRect = this.canvas.upperCanvasEl.getBoundingClientRect();

            var isMac = (window.navigator.appVersion.indexOf('Mac') >= 0);
            $(document).on('keydown', function(e) {
                if (e.keyCode === 90 && e[isMac ? 'metaKey' : 'ctrlKey']) {
                    this.undo();
                }
            }.bind(this));

            this.canvas.on({
                // in general, to prevent selection-edit mess with text fields
                // TODO move to text tool
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

                    if (!selectionActivated) {
                        canvasRect = canvas.upperCanvasEl.getBoundingClientRect();
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

        registerTool: function(name, tool) {

            this.tools[name] = tool;
        },

        selectTool: function(name) {

            if (this.selectedTool) {
                this.tools[this.selectedTool].disable();
            }

            this.selectedTool = name;
            if (this.tools[this.selectedTool]) {
                this.tools[this.selectedTool].enable(this.options, this.canvas);
                this.tools[this.selectedTool].saveState = this.saveState.bind(this);
                if (this.onToolSelected) {
                    this.onToolSelected(this.selectedTool);
                }
            }
        },

        setColor: function(value) {

            this.options.color = value;
            this.selectTool(this.selectedTool);
        },

        saveState: function() {

            var tool = this.tools[this.selectedTool];
            var state = tool.getState ? tool.getState() : null;

            this.states.push({
                state: state,
                tool: this.selectedTool
            });

            if (this.onStateAdded) {
                this.onStateAdded();
            }
        },

        undo: function() {

            var state = this.states.pop();
            if (state && this.tools[state.tool].undo) {
                this.tools[state.tool].undo(state.state);
            }

            if (this.onUndo) {
                this.onUndo();
            }
        }
    });
});
