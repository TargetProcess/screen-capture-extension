define([
    '/scripts/image-editor/tools.js'
], function (ToolKit) {

    var noop = function(f) {
        return f || function() {};
    };

    function CanvasPaint() {
        var tool;
        var context, canvas, canvaso, contexto;

         // The active tool instance.
        this.init = function(actionsLogger) {

            this.actionsLogger = actionsLogger;
            this.actionsLogger.addScriptWithNoUndo("var canvas, context, canvaso, contexto;\r\n");


            // Find the canvas element.
            canvaso = document.getElementById('imageView');
            this.actionsLogger.addScriptWithNoUndo("canvaso = document.getElementById('imageView');\r\n");


            // Get the 2D canvas context.
            contexto = canvaso.getContext('2d');
            this.actionsLogger.addScriptWithNoUndo("context = canvaso.getContext('2d');\r\n");


            // Add the temporary canvas.
            canvas = document.createElement('canvas');
            canvas.id = 'imageTemp';
            canvas.width = canvaso.width;
            canvas.height = canvaso.height;
            canvaso.parentNode.appendChild(canvas);


            context = canvas.getContext('2d');
            context.strokeStyle = ("#FF0000");


            this.tools = new ToolKit(context, canvas);
            tool = this.tool_change('pencil');

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', commonMousePatternHandler, false);
            canvas.addEventListener('mousemove', commonMousePatternHandler, false);
            canvas.addEventListener('mouseup',   commonMousePatternHandler, false);
        }.bind(this);

        this.tool_change = function (toolName) {
            tool = new this.tools[toolName]();
            return tool;
        }.bind(this);

        this.changeColor = function (color) {
            context.strokeStyle = '#' + color;
        };

        this.setLineWidth = function (width, allowUndo) {
            context.lineWidth = parseInt(width, 10);
            this.actionsLogger.addScriptWithUndoSupport("context.lineWidth = " + width + ";\r\n", allowUndo);
        }.bind(this);

        this.RepaintByScript = function (script) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            contexto.clearRect(0, 0, canvas.width, canvas.height);
            tool.started = false;
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
            eval(script);
        };

        var img_update = function() {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        };

        function commonMousePatternHandler(ev) {
            ev._x = ev.offsetX;
            ev._y = ev.offsetY;

            var methodsMap = {
                mousedown: function(e) {
                    tool.started = true;
                    tool.x0 = ev._x;
                    tool.y0 = ev._y;
                    noop(tool.mousedown.bind(tool))(e);
                },
                mousemove: function(e) {
                    if (tool.started) {
                        noop(tool.mousemove.bind(tool))(e);
                    }
                },
                mouseup: function(e) {
                    tool.mousemove(ev);
                    tool.started = false;
                    noop(tool.mouseup.bind(tool))(e);
                    img_update();
                }
            };

            methodsMap[ev.type](ev);
        }
    }

    return CanvasPaint;
});