define([], function () {

    function ToolKit(contexto, context, canvas) {
        var tools = this;

        // This function draws the #imageTemp canvas on top of #imageView, after which
        // #imageTemp is cleared. This function is called each time when the user
        // completes a drawing operation.
        var img_update = function() {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        // The rectangle tool.
        tools.rect = function () {
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

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

            this.mouseup = function (ev) {
                tool.mousemove(ev);
                tool.started = false;
                img_update();
            };
        };

        // The line tool.
        tools.line = function () {
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

                context.clearRect(0, 0, canvas.width, canvas.height);

                context.beginPath();
                context.moveTo(tool.x0, tool.y0);
                context.lineTo(ev._x, ev._y);
                context.stroke();
                context.closePath();
            };

            this.mouseup = function (ev) {
                tool.mousemove(ev);
                tool.started = false;
                img_update();
            };
        };

        // The circle tool.
        tools.circle = function () {
            var tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

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

            this.mouseup = function (ev) {
                tool.mousemove(ev);

                var startingAngle = 0;
                var endingAngle = 2 * Math.PI; // 360 degrees is equal to 2Ï€ radians
                var dx = Math.abs(ev._x - tool.x0),
                    dy = Math.abs(ev._y - tool.y0),
                    x = Math.min(ev._x, tool.x0) + (dx / 2),
                    y = Math.min(ev._y, tool.y0) + (dy / 2),
                    r = Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
                var circumference = Math.max(dx, dy);
                var scaleX = dx / circumference;
                var scaleY = dy / circumference;

                tool.started = false;
                img_update();
            };
        };

        // The drawing eraser.
        tools.eraser = function () {
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                tool.mousemove(ev);
                tool.started = false;
                img_update();
            };
        };

        // The drawing pencil.
        tools.pencil = function () {
            var tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                tool.mousemove(ev);
                tool.started = false;
                img_update();
            };
        };

        // The arrow tool.
        tools.arrow = function () {
            var tool = this;
            this.started = false;


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


            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };

            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }

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

            this.mouseup = function (ev) {
                tool.mousemove(ev);
                tool.started = false;
                img_update();
            };
        };
    }

    return ToolKit;
});