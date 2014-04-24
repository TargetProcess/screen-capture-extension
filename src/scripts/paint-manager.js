define([
    'Class',
    './tools/pencil',
    './tools/line'
    // './components/tools'
], function(Class, PencilTool, LineTool) {

    'use strict';

    var setImageAsBackground = function(url, canvas) {

        var defer = Q.defer();

        fabric.Image.fromURL(url, function(img) {

            var w = img.getWidth();
            var h = img.getHeight();

            var dpxRatio = window.devicePixelRatio;

            var xw = w / dpxRatio;
            var xh = h / dpxRatio;

            img.setWidth(xw);
            img.setHeight(xh);

            canvas.setDimensions({
                width: img.getWidth(),
                height: img.getHeight()
            });

            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
            defer.resolve(canvas);
        });

        return defer.promise;
    };

    var createCanvas = function(url) {

        var canvas = new fabric.Canvas('imageView', {
            selection: false,
            skipTargetFind: true,
            perPixelTargetFind: true,
            targetFindTolerance: 5,

            // isDrawingMode: true,
            backgroundColor: '#ff5400',
            width: 500,
            height: 500
        });

        // canvas.renderAll();

        return setImageAsBackground(url, canvas);
    };

    return Class.extend({

        init: function(options) {

            this.states = [];

            $(document).on('keydown', function(e) {
                // debugger
                if (e.keyCode === 32) {
                    this.undo();
                }
            }.bind(this));

            this.tools = {};
            this.options = options;

            this.selectedTool = null;

        },

        start: function(canvasId, url) {
            return createCanvas(url).then(function(canvas) {
                this.canvas = canvas;
                this.initEvents();
                // this.saveState();

            }.bind(this));
            // this.

            // this.toolKit = (new ToolKit(fabricCanvas))
            //     .setFont(options.font)
            //     .setColor(options.color)
            //     .setLine(options.line);

            // this.changeTool('pencil');
        },

        initTools: function() {
            // this.tools = {
            //     'pencil': new PencilTool(this.canvas),
            //     'line': new LineTool(this.canvas)
            //     // 222: 333,
            // };
        },

        registerTool: function(name, tool) {
            this.tools[name] = tool;
        },

        saveState: function(figure) {
            // console.log(this.canvas.toJSON());
            this.states.push(figure);
        },

        undo: function() {
            debugger;
            this.canvas.remove(this.states.pop());
            this.canvas.renderAll();
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


            // var tool = this.toolKit.create(toolName);

            // if (tool) {
            //     if (this.tool) {
            //         this.tool.destroy();
            //     }

            //     this.tool = tool;
            //     return this.tool;
            // }
            // return null;
        },

        setColor: function(color) {
            this.options.color = color;
        },

        initEvents: function() {
            var selectionActivated = false;
            var isDrawMode = false;
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
                    if (!selectionActivated) {
                        isDrawMode = true;
                        this.trigger('custom:mousedown', evt.e);
                    }
                },
                'mouse:move': function(evt) {
                    if (isDrawMode) {
                        this.trigger('custom:mousemove', evt.e);
                    }
                },
                'mouse:up': function(evt) {
                    if (isDrawMode) {
                        this.trigger('custom:mouseup', evt.e);
                        isDrawMode = false;
                    }
                }
            });
        }

        // setLineWidth: function(width) {
        //     this.toolKit.setLine(width);
        // }
    });
});
