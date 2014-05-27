define(['Class'], function(Class) {

    'use strict';

    return Class.extend({

        init: function(options) {

            this.states = [];

            this.tools = {};
            this.options = options;
            this.options.shadow = {
                color: 'rgba(0,0,0,0.3)',
                offsetX: 1,
                offsetY: 1,
                blur: 1
            };

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
                width: 4000, // big numbers to prevent strange bugs of selection when resize up
                height: 4000
            });

            // Scale the canvas for retina
            this.canvas.setDimensionsCorrect = function(obj) {
                var c = this.getElement();
                this.width = obj.width;
                this.height = obj.height;
                var w = obj.width * window.devicePixelRatio;
                var h = obj.height * window.devicePixelRatio;

                c.setAttribute('width', w);
                c.setAttribute('height', h);
                c.getContext('2d').scale(window.devicePixelRatio, window.devicePixelRatio);

                var nc = c.nextSibling;
                nc.setAttribute('width', obj.width);
                nc.setAttribute('height', obj.height); // no scale here

                $(c.parentElement).add(c).add(c.nextSibling).css({
                    width: obj.width + 'px',
                    height: obj.height + 'px'
                });

                this.calcOffset();
            };
        },

        setImageAsBackground: function(url) {

            return Q
                .when(this.loadImage(url))
                .then(function(img) {

                    var w = img.getWidth() / window.devicePixelRatio;
                    var h = img.getHeight() / window.devicePixelRatio;

                    this.canvas.setDimensionsCorrect({
                        width: w,
                        height: h
                    });

                    img.set({
                        evented: false,
                        selectable: false,
                        left: 0,
                        top: 0,
                        scaleX: 1 / window.devicePixelRatio,
                        scaleY: 1 / window.devicePixelRatio
                    });

                    this.canvas.add(img);
                    this.canvas.renderAll();
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
            if (this.selectedTool !== 'text') {
                this.selectTool(this.selectedTool);
            }
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

        exportDataURL: function() {

            var def = Q.defer();
            this.canvas.clone(function(canvas) {
                def.resolve(canvas.toDataURLWithMultiplier('png', window.devicePixelRatio, 10));
            });
            return def.promise;
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

            /*eslint-disable */
            fabric.Line.prototype._setWidthHeight = function(options) {
                options || (options = {});

                this.width = this.width || Math.abs(this.x2 - this.x1) || 1;
                this.height = this.height || Math.abs(this.y2 - this.y1) || 1;

                this.left = 'left' in options ? options.left : this._getLeftToOriginX();

                this.top = 'top' in options ? options.top : this._getTopToOriginY();
            };
        }
    });
});
