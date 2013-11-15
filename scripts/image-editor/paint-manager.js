define([], function () {

    function CanvasPaint() {
        // This object holds the implementation of each drawing tool.
        var self = this;
        var tools = {};
        var tool;
        var context;
        var canvas, canvaso, contexto;
        var tool_default = 'pencil'; // The active tool instance.
        var kDoNotRunLocallyText_start = "/* do not run locally - start */";
        var kDoNotRunLocallyText_end = "/* do not run locally - end */";

        this.tool_change = function (tool) {
            if (tools[tool]) {
                tool = new tools[tool]();
            }
        };


        this.changeColor = function (color) {
            return changeColor(color);
        };

        var changeColor = function (color) {
            context.strokeStyle = '#' + color;

            //this.actionsLogger.addScript(
            //    "context.strokeStyle = '#" + color + "';\r\n"
            //  );
        };

        this.setLineWidth = function (width, allowUndo) {
            context.lineWidth = parseInt(width, 10);

            self.actionsLogger.addScriptWithUndoSupport(
                "context.lineWidth = " + width + ";\r\n", allowUndo
            );
        };

        this.RepaintByScript = function (script) {
            var doNotRunIndex_start = script.indexOf(kDoNotRunLocallyText_start);
            var doNotRunIndex_end = script.indexOf(kDoNotRunLocallyText_end) + kDoNotRunLocallyText_end.length;
            var doNotRunText = script.substring(doNotRunIndex_start, doNotRunIndex_end);
            //script = script.replace(doNotRunText, "");
            //script = script.replace("context", "contextttt");

            context.clearRect(0, 0, canvas.width, canvas.height);
            contexto.clearRect(0, 0, canvas.width, canvas.height);
            tool.started = false;
            img_update();
            eval(script);
        };

        // The general-purpose event handler. This function just determines the mouse
        // position relative to the canvas element.
        function ev_canvas(ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }

            // Call the event handler of the tool.
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }

        // This function draws the #imageTemp canvas on top of #imageView, after which
        // #imageTemp is cleared. This function is called each time when the user
        // completes a drawing operation.
        function img_update() {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }


        // The rectangle tool.
        tools.rect = function () {
            tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                var right = 2;

                if (ev.button === right) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    tool.started = false;
                    img_update();
                    return;
                }
                else if (tool.started) {
                    tool.mousemove(ev);

                    var x = Math.min(ev._x, tool.x0),
                        y = Math.min(ev._y, tool.y0),
                        w = Math.abs(ev._x - tool.x0),
                        h = Math.abs(ev._y - tool.y0);
                    self.actionsLogger.addScript(
                        "context.strokeStyle = '#" + $(".color").val() + "';\r\n" +
                            "context.strokeRect(" + x + ", " + y + ", " + w + ", " + h + ");\r\n"
                    );


                    tool.started = false;
                    img_update();
                }
                else {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                }
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

            };
        };

        // The line tool.
        tools.line = function () {
            tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                var right = 2;

                if (ev.button === right) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    tool.started = false;
                    img_update();
                    return;
                }
                else if (tool.started) {
                    tool.mousemove(ev);

                    self.actionsLogger.addScript(
                        "context.strokeStyle = '#" + $(".color").val() + "';\r\n" +
                            "context.beginPath();\r\n" +
                            "context.moveTo(" + tool.x0 + ", " + tool.y0 + ");\r\n" +
                            "context.lineTo(" + ev._x + ",   " + ev._y + ");\r\n" +
                            "context.stroke();\r\n" +
                            "context.closePath();\r\n"

                    );

                    tool.started = false;
                    img_update();
                }
                else {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;

                }
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

            };
        };

        // The circle tool.
        tools.circle = function () {
            tool = this;
            this.started = false;

            this.mousedown = function (ev) {
                var right = 2;

                if (ev.button === right) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    tool.started = false;
                    img_update();
                    return;
                }
                else if (tool.started) {
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
                    self.actionsLogger.addScript(
                        "context.strokeStyle = '#" + $(".color").val() + "';\r\n" +
                            "context.save();\r\n" +
                            "context.translate(" + x + ", " + y + ");\r\n" +
                            "context.scale(" + scaleX + ", " + scaleY + ");\r\n" +
                            "context.beginPath();\r\n" +
                            "context.arc(" + 0 + ", " + 0 + ", " + r + ", " + startingAngle + ", " + endingAngle + ", false);\r\n" +
                            "context.stroke();\r\n" +
                            "context.closePath();\r\n" +
                            "context.restore();\r\n"
                    );

                    tool.started = false;
                    img_update();
                }
                else {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                }
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

            };
        };

        // The drawing eraser.
        tools.eraser = function () {
            tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;

                self.actionsLogger.addScript(
                    "context.strokeStyle = '#FFFFFF';\r\n" +
                        "context.beginPath();\r\n" +
                        "context.moveTo(" + ev._x + ", " + ev._y + ");\r\n"
                );
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();

                    self.actionsLogger.addScript(
                        "context.lineTo(" + ev._x + ", " + ev._y + ");\r\n" +
                            "context.stroke();\r\n"
                    );
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        // The drawing pencil.
        tools.pencil = function () {
            tool = this;
            this.started = false;

            // This is called when you start holding down the mouse button.
            // This starts the pencil drawing.
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;

                self.actionsLogger.addScript(
                    "context.strokeStyle = '#" + $(".color").val() + "';\r\n" +
                        "context.beginPath();\r\n" +
                        "context.moveTo(" + ev._x + ", " + ev._y + ");\r\n"
                );
            };

            // This function is called every time you move the mouse. Obviously, it only
            // draws if the tool.started state is set to true (when you are holding down
            // the mouse button).
            this.mousemove = function (ev) {
                if (tool.started) {
                    context.lineTo(ev._x, ev._y);
                    context.stroke();

                    self.actionsLogger.addScript(
                        "context.lineTo(" + ev._x + ", " + ev._y + ");\r\n" +
                            "context.stroke();\r\n"
                    );
                }
            };

            // This is called when you release the mouse button.
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        this.init = function(actionsLogger) {

            self.actionsLogger = actionsLogger;

            self.actionsLogger.addScriptWithNoUndo(
                //kDoNotRunLocallyText_start + "var canvas, context, canvaso, contexto;\r\n" + kDoNotRunLocallyText_end
                "var canvas, context, canvaso, contexto;\r\n"
            );

            // Find the canvas element.
            canvaso = document.getElementById('imageView');

            self.actionsLogger.addScriptWithNoUndo(
                "canvaso = document.getElementById('imageView');\r\n"
            );

            if (!canvaso) {
                alert('Error: I cannot find the canvas element!');
                return;
            }

            if (!canvaso.getContext) {
                alert('Error: no canvas.getContext!');
                return;
            }

            // Get the 2D canvas context.
            contexto = canvaso.getContext('2d');

            self.actionsLogger.addScriptWithNoUndo(
                "context = canvaso.getContext('2d');\r\n"
            );

            if (!contexto) {
                alert('Error: failed to getContext!');
                return;
            }

            // Add the temporary canvas.
            var container = canvaso.parentNode;
            canvas = document.createElement('canvas');
            if (!canvas) {
                alert('Error: I cannot create a new canvas element!');
                return;
            }

            canvas.id = 'imageTemp';
            canvas.width = canvaso.width;
            canvas.height = canvaso.height;
            container.appendChild(canvas);

            context = canvas.getContext('2d');

            // Activate the default tool.
            if (tools[tool_default]) {
                tool = new tools[tool_default]();
                //tool_select.value = tool_default;
            }
            context.strokeStyle = ("#000000");

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas.addEventListener('mouseup', ev_canvas, false);

            $(canvas).bind('contextmenu', function (e) {
                return false;
            });
        }
    }

    return CanvasPaint;
});