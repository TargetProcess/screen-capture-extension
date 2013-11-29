define([
    '/scripts/libs/class.js'
], function (Class) {

    var noop = function(f) {
        return f || function() {};
    };

    var ToolBase = Class.extend({

        init: function(context, canvas) {
            this.context = context;
            this.canvas = canvas;
            this.onFinalize = $.Callbacks();
        }
    });

    var ToolDnDBase = ToolBase.extend({

        init: function(context, canvas) {
            this._super(context, canvas);

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
            var tool = this;
            var context = this.context;
            var canvas = this.canvas;

            context.lineTo(ev._x, ev._y);
            context.stroke();
        }
    });

    var Arrow = ToolDnDBase.extend({

        drawArrowhead: function(ctx, ex, ey, angle, sizex, sizey) {
            ctx.save();

            ctx.fillStyle = ctx.strokeStyle;

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

    var Text = ToolDnDBase.extend({

        mousedown: function (ev) {
            var tool = this;
            var context = this.context;
            var canvas = this.canvas;

            var sx = tool.x0;
            var sy = tool.y0;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = context.strokeStyle;
            context.font = 'bold 16px sans-serif';
            context.textBaseline = 'top';
            context.textAlign = 'left';
            context.fillText('this is text!!!', sx, sy);
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
        create: function(toolName) {
            return new this[toolName](this.context, this.canvas);
        }
    };

    return ToolKit;
});