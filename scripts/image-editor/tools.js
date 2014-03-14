define([
    '/scripts/libs/class.js'
], function (Class) {

    var canvas = function(r) {
        var c = document.createElement('CANVAS');
        c.width = r.width;
        c.height = r.height;
        return c;
    };

    var noop = function(f) {
        return f || function() {};
    };

    var ToolBase = Class.extend({

        init: function(scene, options) {
            this.scene = scene;
            this.options = options;
            this.onFinalize = $.Callbacks();
            this.onFinalize.add(this.applyImage.bind(this));
        },

        api: function() {
            var prmCtx = this.scene.primary.context;
            var slv = this.scene.layer();
            var slvCtx = this.scene.slave.context;

            slvCtx.exClear = function() {
                slvCtx.clearRect(0, 0, slv.width, slv.height);
            };

            slvCtx.exApply = function() {
                prmCtx.drawImage(slv, 0, 0);
                slvCtx.exClear();
            };
            return slvCtx;
        },

        applyImage: function () {
            this.api().exApply();
        }
    });

    var ToolDnDBase = ToolBase.extend({

        init: function(scene, options) {
            this._super(scene, options);

            this.subscribeToEvents = 'mousedown mousemove mouseup';
            $(this.scene.layer())
                .on(this.subscribeToEvents,
                    this.commonMousePatternHandler.bind(this));
        },

        destroy: function() {
            $(this.scene.layer())
                .off(this.subscribeToEvents);
        },

        commonMousePatternHandler: function(ev) {

            var tool = this;
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;

            var methodsMap = {
                mousedown: function(e) {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                    noop(tool.mousedown).bind(tool)(e);
                },
                mousemove: function(e) {
                    if (tool.started) {
                        noop(tool.mousemove).bind(tool)(e);
                    }
                },
                mouseup: function(e) {
                    noop(tool.mouseup).bind(tool)(ev);
                    tool.started = false;
                    noop(tool.mouseup).bind(tool)(e);

                    tool.onFinalize.fire();
                }
            };

            methodsMap[ev.type](ev);
        }
    });

    var Crop = ToolBase.extend({

        name: 'crop',

        init: function(scene, options, fabricCanvas) {
            this._super(scene, options);

            this.fabricCanvas = fabricCanvas;

            this.fabricCanvas.selection = false;
            this.fabricCanvas.skipTargetFind = true;

            this.started = true;
            this.rect = {};
            $(this.scene.layer()).imgAreaSelect({
                handles: true,
                onSelectStart: this.createToolTip.bind(this),
                onSelectEnd: function (img, selection) {
                    this.rect = selection;
                }.bind(this)
            });

            $(document).on('keydown.crop', function(e) {
                if (e.which === 27) {
                    this.onEscape();
                }
            }.bind(this));
        },

        destroy: function() {

            this.fabricCanvas.selection = true;
            this.fabricCanvas.skipTargetFind = false;

            this.started = false;
            $(document).off('.crop');
            $(this.scene.layer()).imgAreaSelect({ remove: true });
        },

        createToolTip: function() {
            var $tooltip = $('.i-role-img-area-select-box-tooltip');
            if (!$tooltip.length) {
                $tooltip = $('<div><a class="i-role-action-crop" style="color:white;" href="#">crop</a></div>');
                $tooltip
                    .addClass('i-role-img-area-select-box-tooltip')
                    .css({
                        width: '50px',
                        height: '25px',
                        'background-color': 'rgba(0,25,0, 0.25)',
                        left: '1px',
                        top: '1px',
                        position: 'absolute',
                        'text-align': 'center',
                        color: 'white',
                        'border-radius': '5px'
                    });

                $tooltip.on('click', '.i-role-action-crop', this.onEnter.bind(this));
                $('.i-role-img-area-select-box').append($tooltip);
            }
        },

        removeToolTip: function() {
            $('.i-role-img-area-select-box-tooltip').remove();
        },

        onEnter: function() {
            var r = this.rect;

            this.removeToolTip();
            $(this.scene.layer()).imgAreaSelect({ hide: true });

            var b64Image = this.fabricCanvas.toDataURL();
            fabric.Image.fromURL(b64Image, function(img) {

                var tmpCnvs = canvas(r);
                tmpCnvs
                    .getContext('2d')
                    .drawImage(img._element, r.x1, r.y1, r.width, r.height, 0, 0, r.width, r.height);

                var cropB64 = tmpCnvs.toDataURL('image/png');

                var href = location.href;

                var x = ([
                    href.substr(0, href.indexOf('?')),
                    '?',
                    'id=',
                    (+ new Date()),
                    '#b64=',
                    cropB64
                ].join(''));

                window.open(x);

            });
        },

        onEscape: function() {
            $(this.scene.layer()).imgAreaSelect({ hide: true });
        }
    });

    function ToolKit(fabricCanvas) {
        var tools = this;

        this.options = {};

        this.fabricCanvas = fabricCanvas;


        var selectionActivated = false;
        var isDrawMode = false;
        this.fabricCanvas.on({
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


        this.primaryCanvas = null;
        this.slaveCanvas = null;

        tools.rect = Class.extend({
            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.start = this.start.bind(this);
                this.move = this.move.bind(this);
                this.stop = this.stop.bind(this);

                this.subscriptions = {
                    'custom:mousedown': this.start,
                    'custom:mousemove': this.move,
                    'custom:mouseup': this.stop
                };

                this.fabricCanvas.on(this.subscriptions);
            },

            destroy: function() {
                this.fabricCanvas.off(this.subscriptions);
            },

            start: function (e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

                this.fabricCanvas.selection = false;

                this.figure = new fabric.Rect({
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width,
                    fill: 'rgba(0, 0, 0, 0)',
                    width: 1,
                    height: 1
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.renderAll();
            },

            move: function (e) {
                this.figure.set({
                    width: e.offsetX - this.x0,
                    height: e.offsetY - this.y0
                });
                this.fabricCanvas.renderAll();
            },

            stop: function (ev) {
                this.fabricCanvas.selection = true;
            }
        });

        tools.line = Class.extend({
            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.start = this.start.bind(this);
                this.move = this.move.bind(this);
                this.stop = this.stop.bind(this);

                this.subscriptions = {
                    'custom:mousedown': this.start,
                    'custom:mousemove': this.move,
                    'custom:mouseup': this.stop
                };

                this.fabricCanvas.on(this.subscriptions);
            },

            destroy: function() {
                this.fabricCanvas.off(this.subscriptions);
            },

            start: function (e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

                this.fabricCanvas.selection = false;

                this.figure = new fabric.Line(null, {
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.renderAll();
            },

            move: function (e) {
                var x1 = this.x0;
                var y1 = this.y0;
                var x2 = e.offsetX;
                var y2 = e.offsetY;

                var angleRadian = Math.atan((y2 - y1) / (x2 - x1));
                var angleDegree = angleRadian / Math.PI * 180;

                var hypotenuse = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                var k = (x2 >= x1) ? 1 : -1;

                this.figure.set({
                    angle: angleDegree,
                    width: k * hypotenuse
                });
                this.fabricCanvas.renderAll();
            },

            stop: function (ev) {
                this.fabricCanvas.selection = true;
            }
        });

        tools.pencil = Class.extend({
            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.fabricCanvas.isDrawingMode = true;
                this.fabricCanvas.freeDrawingBrush.width = options.width;
                this.fabricCanvas.freeDrawingBrush.color = options.color;
            },

            destroy: function() {
                this.fabricCanvas.isDrawingMode = false;
            }
        });

        tools.arrow = Class.extend({
            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.start = this.start.bind(this);
                this.move = this.move.bind(this);
                this.stop = this.stop.bind(this);

                this.subscriptions = {
                    'custom:mousedown': this.start,
                    'custom:mousemove': this.move,
                    'custom:mouseup': this.stop
                };

                this.fabricCanvas.on(this.subscriptions);
            },

            destroy: function() {
                this.fabricCanvas.off(this.subscriptions);
            },

            start: function (e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

                this.fabricCanvas.selection = false;

                this.figure = new fabric.Arrow(null, {
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.renderAll();
            },

            move: function (e) {
                var x1 = this.x0;
                var y1 = this.y0;
                var x2 = e.offsetX;
                var y2 = e.offsetY;

                var angleRadian = Math.atan((y2 - y1) / (x2 - x1));
                var angleDegree = angleRadian / Math.PI * 180;

                var hypotenuse = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                var k = (x2 >= x1) ? 1 : -1;

                this.figure.set({
                    angle: angleDegree,
                    width: k * hypotenuse
                });
                this.fabricCanvas.renderAll();
            },

            stop: function (ev) {
                this.fabricCanvas.selection = true;
            }
        });

        tools.text = Class.extend({

            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.fabricCanvas.selection = false;
                this.fabricCanvas.skipTargetFind = true;

                this.isJustStarted = true;
                this.isEditMode = false;
                this.completedWithoutMouse = false;

                $(document).on('keydown', function (e) {

                    if (e.ctrlKey && e.which === 13) {
                        this.isEditMode && this.onPressEnter();
                        this.isEditMode = false;
                        this.completedWithoutMouse = true;
                    }

                }.bind(this));

                this.subscriptions = {

                    'custom:mousedown': function(e) {

                        if (this.isJustStarted) {
                            this.isJustStarted = false;
                            return;
                        }


                        if (this.completedWithoutMouse === true) {
                            this.completedWithoutMouse = false;
                            this.isEditMode = false;
                        }
                        else {
                            this.completedWithoutMouse = true;
                            this.isEditMode = true;
                        }

                    }.bind(this),

                    'custom:mouseup': function(e) {

                        if (this.isEditMode) {

                            this.onCompleteEnter(e);
                        }
                        else {

                            this.onStartEnter(e);
                        }

                    }.bind(this),

                    'custom:selected': function(e) {

                        this.isEditMode = true;

                    }.bind(this),

                    'custom:selection-cleared': function(e) {

                        this.isEditMode = false;

                    }.bind(this)

                };

                this.fabricCanvas.on(this.subscriptions);
            },

            destroy: function() {

                this.fabricCanvas.selection = true;
                this.fabricCanvas.skipTargetFind = false;

                $(document).off('keydown');
                this.fabricCanvas.off(this.subscriptions);
            },

            onPressEnter: function() {

                this.fabricCanvas.trigger(
                    'before:selection:cleared',
                    { target: this.figure });

                this.fabricCanvas.discardActiveObject();
            },

            onStartEnter: function (e) {

                this.isEditMode = true;

                var DEFAULT_TEXT = 'NOTE: ...';
                this.figure = new fabric.IText(DEFAULT_TEXT, {
                    fontSize: 24,
                    fontFamily: 'monospace',
                    fontWeight: 'normal',
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width,
                    selectionStart: 6,
                    selectionEnd: 9
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.setActiveObject(this.figure);

                this.figure.enterEditing();
                this.figure.initDelayedCursor();

                this.fabricCanvas.renderAll();
            },

            onCompleteEnter: function (e) {

                this.isEditMode = false;

            }
        });

        tools.pointer = Class.extend({

            init: function(scene, options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.initialState = {
                    selection: fabricCanvas.selection,
                    skipTargetFind: fabricCanvas.skipTargetFind
                };

                this.fabricCanvas.selection = true;
                this.fabricCanvas.skipTargetFind = false;

                $(document).on('keydown', function (e) {
                    var DEL_KEY = 46;
                    if (e.which === DEL_KEY) {
                        var objct = this.fabricCanvas.getActiveObject();
                        var group = this.fabricCanvas.getActiveGroup();

                        var objects = [];
                        if (group) {
                            objects = group.getObjects();
                        }
                        else if (objct) {
                            objects = [objct];
                        }

                        for (var i = 0; i < objects.length; i++) {
                            objects[i].remove();
                        }

                        this.fabricCanvas.discardActiveGroup();
                        this.fabricCanvas.renderAll();
                    }

                }.bind(this));
            },

            destroy: function() {

                this.fabricCanvas.selection = this.initialState.selection;
                this.fabricCanvas.skipTargetFind = this.initialState.skipTargetFind;

                $(document).off('keydown');
            }
        });

        tools.crop = Crop;
    }

    ToolKit.prototype = {

        create: function(toolName) {
            var self = this;
            var scene = {
                primary: this.primaryCanvas,
                slave: this.slaveCanvas,
                resize: function(r) {
                    this.primary.resize(r);
                    this.slave.resize(r);

                    this.slave.context.font = self.options.font;
                    this.slave.context.strokeStyle = self.options.color;
                    this.slave.context.lineWidth = self.options.width;
                },
                canvas: function() {
                    return self.fabricCanvas;
                },
                layer: function() {
                    return self.fabricCanvas.upperCanvasEl;
                }
            };
            return new this[toolName](scene, this.options, this.fabricCanvas);
        },

        setFont: function(font) {
            this.options.font = font;
            return this;
        },

        setColor: function(color) {
            this.options.color = color;
            return this;
        },

        setLine: function(width) {
            this.options.width = width;
            return this;
        }
    };

    return ToolKit;
});