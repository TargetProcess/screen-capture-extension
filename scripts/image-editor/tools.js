define([
    '/scripts/libs/class.js'
], function (Class) {

    var noop = function(f) {
        return f || function() {};
    };

    var ToolBase = Class.extend({

        init: function(context, canvas, options) {
            this.context = context;
            this.canvas = canvas;
            this.options = options;
            this.onFinalize = $.Callbacks();
        }
    });

    var ToolDnDBase = ToolBase.extend({

        init: function(context, canvas, options) {
            this._super(context, canvas, options);

            this.subscribeToEvents = 'mousedown mousemove mouseup';
            $(this.canvas)
                .on(this.subscribeToEvents,
                    this.commonMousePatternHandler.bind(this));
        },

        destroy: function() {
            $(this.canvas)
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

    var Rect = ToolDnDBase.extend({
        mousemove: function (ev) {
            var tool = this;
            var x = Math.min(ev._x, tool.x0),
                y = Math.min(ev._y, tool.y0),
                w = Math.abs(ev._x - tool.x0),
                h = Math.abs(ev._y - tool.y0);

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (!w || !h) {
                return;
            }

            this.context.strokeRect(x, y, w, h);
        }
    });

    var Line = ToolDnDBase.extend({
        mousemove: function (ev) {
            var tool = this;
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.context.beginPath();
            this.context.moveTo(tool.x0, tool.y0);
            this.context.lineTo(ev._x, ev._y);
            this.context.stroke();
            this.context.closePath();
        }
    });

    var Circ = ToolDnDBase.extend({
        mousemove: function (ev) {
            var tool = this;
            var context = this.context;
            var canvas = this.canvas;

            var dx = Math.abs(ev._x - tool.x0),
                dy = Math.abs(ev._y - tool.y0),
                x = Math.min(ev._x, tool.x0) + Math.round(dx / 2),
                y = Math.min(ev._y, tool.y0) + Math.round(dy / 2),
                r = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));

            context.clearRect(0, 0, canvas.width, canvas.height);

            var startingAngle = 0;
            var endingAngle = 2 * Math.PI; // 360 degrees is equal to 2Ï€ radians

            var circumference = Math.max(dx, dy);
            var scaleX = dx / circumference;
            var scaleY = dy / circumference;

            if (!x || !y || !r || !circumference || !scaleX || !scaleY) {
                return;
            }

            context.save();
            context.translate(x, y);
            context.scale(scaleX, scaleY);
            context.beginPath();
            context.arc(0, 0, r, startingAngle, endingAngle, false);
            context.stroke();
            context.closePath();
            context.restore();
        }
    });

    var Eraser = ToolDnDBase.extend({

        mousedown: function (ev) {
            var context = this.context;
            context.beginPath();
            context.moveTo(ev._x, ev._y);
        },

        mousemove: function (ev) {
            var tool = this;
            var context = this.context;
            var canvas = this.canvas;

            context.lineTo(ev._x, ev._y);
            context.stroke();
        }
    });

    var Pencil = ToolDnDBase.extend({

        mousedown: function (ev) {
            var context = this.context;
            context.beginPath();
            context.moveTo(ev._x, ev._y);
        },

        mousemove: function (ev) {
            var context = this.context;
            context.lineTo(ev._x, ev._y);
            context.stroke();
        }
    });

    var Arrow = ToolDnDBase.extend({

        drawArrowhead: function(ctx, ex, ey, angle, sizex, sizey) {
            ctx.save();

            ctx.fillStyle = this.options.color;

            var hx = sizex / 2;
            var hy = sizey / 2;

            ctx.translate(ex, ey);
            ctx.rotate(angle);
            ctx.translate(-hx, -hy);

            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(0, sizey);
            ctx.lineTo(sizex, hy);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        },

        findAngle: function(sx, sy, ex, ey) {
            // make sx and sy at the zero point
            return Math.atan((ey - sy) / (ex - sx));
        },

        mousemove: function (ev) {
            var tool = this;
            var context = this.context;
            var canvas = this.canvas;

            var sx = tool.x0;
            var sy = tool.y0;
            var ex = ev._x;
            var ey = ev._y;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.moveTo(sx, sy);
            context.lineTo(ex, ey);
            context.stroke();
            context.closePath();

            var ang = this.findAngle(sx, sy, ex, ey);
            this.drawArrowhead(context, ex, ey, ang, 16, 16);
        }
    });

    var Text = ToolBase.extend({

        init: function(context, canvas, options) {
            this._super(context, canvas, options);

            this.subscribeToEvents = 'click';
            $(this.canvas)
                .on(this.subscribeToEvents,
                    this.commonMousePatternHandler.bind(this));
        },

        destroy: function() {
            $(this.canvas)
                .off(this.subscribeToEvents);
        },

        commonMousePatternHandler: function(ev) {
            var tool = this;
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;

            if (tool.started && !$(ev.target).hasClass('i-role-text-editor')) {
                tool.onEnter();
            }
            else {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
                noop(tool.onClick).bind(tool)(ev);
            }
        },

        onClick: function (ev) {
            var tool = this;

            this.textBox = $('<div></div>')
                .addClass('i-role-text-editor')
                .css({
                    position:'absolute',
                    left: tool.x0 + 'px',
                    top: tool.y0 + 'px',
                    border: 'dotted 1px red',
                    color: this.options.color,
                    font: this.options.font,
                    padding: '0 0 0 0'
                })
                .attr('contenteditable', true)
                .appendTo($(this.canvas).parent());

            this.textBox.focus();

            this.textBox
                .on('keydown', function(e) {
                    if (e.ctrlKey && e.which === 13) {
                        this.onEnter();
                    }
                    else if (e.which === 27) {
                        this.onEscape();
                    }
                }.bind(this));
        },

        onEnter: function() {
            var tool = this;
            var height = this.textBox.height();
            var text = this.textBox.html();
            this.textBox.remove();

            var textLines = text
                .replace(/<div>/gi, '\n')
                .replace(/<\/div>/gi, '')
                .replace(/<br>/gi, '')
                .replace(/<br\/>/gi, '')
                .split('\n');

            tool.started = false;

            this.drawMultiLineText(textLines, {
                x: tool.x0,
                y: tool.y0,
                dy: height / textLines.length
            });

            tool.onFinalize.fire();
        },

        onEscape: function() {
            this.textBox.remove();
            this.started = false;
        },

        drawMultiLineText: function(texts, coords) {
            var context = this.context;
            var canvas = this.canvas;

            var sx = coords.x;
            var sy = coords.y;
            var dy = coords.dy;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = this.options.color;
            context.font = this.options.font;
            context.textBaseline = 'top';
            context.textAlign = 'left';

            for (var i = 0, delta = 0; i < texts.length; i++) {
                context.fillText(texts[i], sx, delta + sy);
                delta += dy;
            }
        }
    });

    function ToolKit(context, canvas) {
        var tools = this;
        this.context = context;
        this.canvas = canvas;

        tools.rect = Rect;
        tools.line = Line;
        tools.circle = Circ;
        tools.eraser = Eraser;
        tools.pencil = Pencil;
        tools.arrow = Arrow;
        tools.text = Text;
    }

    ToolKit.prototype = {
        create: function(toolName, options) {
            return new this[toolName](this.context, this.canvas, options);
        }
    };

    return ToolKit;
});