/*globals fabric */
define([
    'Class',
    '../libs/fabric.extensions'
], function(Class) {

    'use strict';

    var canvas = function(r) {
        var c = document.createElement('CANVAS');
        c.width = r.width;
        c.height = r.height;
        return c;
    };

    var DnDBase = Class.extend({

        init: function(options, fabricCanvas) {
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

        start: function() {},
        move: function() {},
        stop: function() {}
    });

    var Crop = Class.extend({

        name: 'crop',

        init: function(options, fabricCanvas) {

            this.options = options;
            this.fabricCanvas = fabricCanvas;

            this.rect = {};
            $(this.layer()).imgAreaSelect({
                handles: true,
                onSelectStart: this.createToolTip.bind(this),
                onSelectEnd: function(img, selection) {
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
            $(document).off('.crop');
            $(this.layer()).imgAreaSelect({
                remove: true
            });
        },

        layer: function() {
            return this.fabricCanvas.upperCanvasEl;
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
            $(this.layer()).imgAreaSelect({
                hide: true
            });

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
                    'id=', Number(new Date()),
                    '#b64=',
                    cropB64
                ].join(''));

                window.open(x);

            });
        },

        onEscape: function() {
            $(this.layer()).imgAreaSelect({
                hide: true
            });
        }
    });

    var ToolKit = function(fabricCanvas) {

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

        this.rect = DnDBase.extend({

            start: function(e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

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

            move: function(e) {
                this.figure.set({
                    width: e.offsetX - this.x0,
                    height: e.offsetY - this.y0
                });
                this.fabricCanvas.renderAll();
            }
        });

        this.line = DnDBase.extend({

            start: function(e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

                this.figure = new fabric.Line(null, {
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.renderAll();
            },

            move: function(e) {
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
            }
        });

        this.pencil = Class.extend({
            init: function(options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.fabricCanvas.isDrawingMode = true;
                this.fabricCanvas.freeDrawingBrush.width = options.width;
                this.fabricCanvas.freeDrawingBrush.color = options.color;
            },

            destroy: function() {
                this.fabricCanvas.isDrawingMode = false;
            }
        });

        this.arrow = DnDBase.extend({

            start: function(e) {
                this.x0 = e.offsetX;
                this.y0 = e.offsetY;

                this.figure = new fabric.Arrow(null, {
                    left: e.offsetX,
                    top: e.offsetY,
                    stroke: this.options.color,
                    strokeWidth: this.options.width
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.renderAll();
            },

            move: function(e) {
                var x1 = this.x0;
                var y1 = this.y0;
                var x2 = e.offsetX;
                var y2 = e.offsetY;

                var angleRadian = Math.atan((y2 - y1) / (x2 - x1));
                var angleDegree = angleRadian / Math.PI * 180;

                var hypotenuse = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                var r = (x2 >= x1);
                var l = !r;
                var b = (y2 >= y1);
                var t = !b;

                var sector = 0;
                if (b && r) {
                    (sector = 0);
                }
                if (b && l) {
                    (sector = -180);
                }
                if (t && l) {
                    (sector = 180);
                }
                if (t && r) {
                    (sector = -360);
                }

                this.figure.set({
                    angle: angleDegree - sector,
                    width: hypotenuse
                });
                this.fabricCanvas.renderAll();
            }
        });

        this.text = Class.extend({

            init: function(options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.isJustStarted = true;
                this.isEditMode = false;
                this.completedWithoutMouse = false;

                $(document).on('keydown.text', function(e) {

                    if (e.ctrlKey && e.which === 13) {
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

            destroy: function() {
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

                var DEFAULT_TEXT = 'NOTE: ...';
                this.figure = new fabric.IText(DEFAULT_TEXT, {
                    fontSize: 24,
                    fontFamily: 'monospace',
                    fontWeight: 'normal',
                    left: e.offsetX,
                    top: e.offsetY,
                    fill: this.options.color,
                    stroke: this.options.color,
                    strokeWidth: 1, //this.options.width,
                    selectionStart: 6,
                    selectionEnd: 9
                });

                this.fabricCanvas.add(this.figure);
                this.fabricCanvas.setActiveObject(this.figure);

                this.figure.enterEditing();
                this.figure.initDelayedCursor();

                this.fabricCanvas.renderAll();
            },

            onCompleteEnter: function() {

                this.isEditMode = false;

            }
        });

        this.pointer = Class.extend({

            init: function(options, fabricCanvas) {
                this.fabricCanvas = fabricCanvas;
                this.options = options;

                this.fabricCanvas.selection = true;
                this.fabricCanvas.skipTargetFind = false;

                $(document).on('keydown.pointer', function(e) {
                    var DEL_KEY = 46;
                    var BSP_KEY = 8;

                    if (e.which === DEL_KEY || e.which === BSP_KEY) {
                        var objct = this.fabricCanvas.getActiveObject();
                        var group = this.fabricCanvas.getActiveGroup();

                        var objects = [];
                        if (group) {
                            objects = group.getObjects();
                        } else if (objct) {
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

                this.fabricCanvas.selection = false;
                this.fabricCanvas.skipTargetFind = true;

                $(document).off('.pointer');
            }
        });

        this.crop = Crop;
    };

    ToolKit.prototype = {

        create: function(toolName) {
            if (this[toolName]) {
                return new(this[toolName])(this.options, this.fabricCanvas);
            }
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
