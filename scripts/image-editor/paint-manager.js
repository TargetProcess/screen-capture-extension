define([
    '/scripts/image-editor/tools.js'
], function (ToolKit) {

    function CanvasPaint() {
        var tool;
        var tmpContext, tmpCanvas, srcCanvas, srcContext;

         // The active tool instance.
        this.init = function(actionsLogger) {

            this.actionsLogger = actionsLogger;
            this.actionsLogger.addScriptWithNoUndo("var canvas, context, canvaso, contexto;\r\n");

            // Find the canvas element.
            srcCanvas = document.getElementById('imageView');
            this.actionsLogger.addScriptWithNoUndo("canvaso = document.getElementById('imageView');\r\n");

            // Get the 2D canvas context.
            srcContext = srcCanvas.getContext('2d');
            this.actionsLogger.addScriptWithNoUndo("context = canvaso.getContext('2d');\r\n");

            // Add the temporary canvas.
            tmpCanvas = document.createElement('canvas');
            tmpCanvas.id = 'imageTemp';
            tmpCanvas.width = srcCanvas.width;
            tmpCanvas.height = srcCanvas.height;
            srcCanvas.parentNode.appendChild(tmpCanvas);

            tmpContext = tmpCanvas.getContext('2d');
            this.changeColor('rgba(255, 0, 0, 0.55)');

            this.tools = new ToolKit(tmpContext, tmpCanvas);
            tool = this.changeTool('pencil');

        }.bind(this);

        this.changeTool = function (toolName) {
            tool && tool.destroy();
            tool = this.tools.create(toolName);
            tool.onFinalize.add(applyImage);
            return tool;
        }.bind(this);

        this.changeColor = function (color) {
            tmpContext.strokeStyle = color;
        };

        this.setLineWidth = function (width, allowUndo) {
            tmpContext.lineWidth = parseInt(width, 10);
            this.actionsLogger.addScriptWithUndoSupport("context.lineWidth = " + width + ";\r\n", allowUndo);
        }.bind(this);

        this.RepaintByScript = function (script) {
            tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            srcContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            tool.started = false;
            srcContext.drawImage(tmpCanvas, 0, 0);
            tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            eval(script);
        };

        var applyImage = function() {
            srcContext.drawImage(tmpCanvas, 0, 0);
            tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
        };
    }

    return CanvasPaint;
});