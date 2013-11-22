define([], function () {

    function ToolKit(context, canvas) {
        var tools = this;

        tools.rect = function () {
            var tool = this;
            this.mousemove = function (ev) {
                var x = Math.min(ev._x, tool.x0),
                    y = Math.min(ev._y, tool.y0),
                    w = Math.abs(ev._x - tool.x0),
                    h = Math.abs(ev._y - tool.y0);

                context.clearRect(0, 0, canvas.width, canvas.height);

                if (!w || !h) {
                    return;
                }

                context.strokeRect(x, y, w, h);
            };
        };

        tools.line = function () {
            var tool = this;
            this.mousemove = function (ev) {
                context.clearRect(0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.moveTo(tool.x0, tool.y0);
                context.lineTo(ev._x, ev._y);
                context.stroke();
                context.closePath();
            };
        };

        tools.circle = function () {
            var tool = this;

            this.mousemove = function (ev) {
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
            };
        };

        tools.eraser = function () {
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
            };

            this.mousemove = function (ev) {
                context.lineTo(ev._x, ev._y);
                context.stroke();
            };
        };

        tools.pencil = function () {
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
            };

            this.mousemove = function (ev) {
                context.lineTo(ev._x, ev._y);
                context.stroke();
            };
        };

        tools.arrow = function () {
            var tool = this;

            function drawArrowhead(ex, ey, angle, sizex, sizey) {
                var ctx = this;

                ctx.save();

                var hx = sizex / 2;
                var hy = sizey / 2;

                ctx.translate(ex, ey);
                ctx.rotate(angle);
                ctx.translate(-hx,-hy);

                ctx.beginPath();
                ctx.moveTo(0,0);
                ctx.lineTo(0, sizey);
                ctx.lineTo(sizex, hy);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }


            function findAngle(sx, sy, ex, ey) {
                // make sx and sy at the zero point
                return Math.atan((ey - sy) / (ex - sx));
            }

            this.mousemove = function (ev) {
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

                var ang = findAngle(sx, sy, ex, ey);
                drawArrowhead.call(context, ex, ey, ang, 12, 12);
            };
        };
    }

    return ToolKit;
});