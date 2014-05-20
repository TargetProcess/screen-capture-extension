define(['Class'], function(Class) {

    'use strict';

    return Class.extend({

        init: function(options) {

            this.states = [];

            this.tools = {};
            this.options = options;

            this.selectedTool = null;

            this.patchFabric();
        },

        start: function(canvasId, url) {

            return Q
                .when(this.initCanvas(canvasId))
                .then(url ? this.setImageAsBackground.bind(this, url) : null)
                .then(this.initEvents.bind(this));
        },

        initCanvas: function(id) {

            this.canvas = new fabric.Canvas(id, {
                selection: false,
                perPixelTargetFind: true,
                targetFindTolerance: 5,
                width: 800,
                height: 600
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
                        isDrawMode = true;
                        this.trigger('custom:mousedown', evt.e);
                    }
                },

                'mouse:move': function(evt) {

                    if (isDrawMode) {
                        var e = evt.e;
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

            if (this.selectedTool === name) {
                return;
            }

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
        },

        patchFabric: function() {

            // correct position without absolute parent
            fabric.util.getScrollLeftTop = function(element, upperCanvasEl) {

                var firstFixedAncestor;
                var origElement;
                var left = 0;
                var top = 0;
                var docElement = fabric.document.documentElement;
                var body = fabric.document.body || {
                    scrollLeft: 0,
                    scrollTop: 0
                };

                origElement = element;

                while (element && element.parentNode && !firstFixedAncestor) {

                    element = element.parentNode;

                    if (element !== fabric.document &&
                        fabric.util.getElementStyle(element, 'position') === 'fixed') {
                        firstFixedAncestor = element;
                    }

                    if (element !== fabric.document &&
                        origElement !== upperCanvasEl &&
                        fabric.util.getElementStyle(element, 'position') === 'absolute') {
                        left = 0;
                        top = 0;
                    } else if (element === fabric.document) {
                        left = body.scrollLeft || docElement.scrollLeft || left;
                        top = body.scrollTop || docElement.scrollTop || top;
                    } else {
                        left += element.scrollLeft || 0;
                        top += element.scrollTop || 0;
                    }
                }

                return {
                    left: left,
                    top: top
                };
            };
        }
    });
});
