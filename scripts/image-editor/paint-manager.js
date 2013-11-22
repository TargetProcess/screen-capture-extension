define([
    '/scripts/image-editor/tools.js'
], function (ToolKit) {

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


            this.tools = new ToolKit(contexto, context, canvas);
            tool = this.tool_change('pencil');

            // Attach the mousedown, mousemove and mouseup event listeners.
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas.addEventListener('mouseup',   ev_canvas, false);
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
    }

    return CanvasPaint;
});