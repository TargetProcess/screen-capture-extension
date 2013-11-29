define([
    '/scripts/libs/class.js',
    '/scripts/image-editor/tools.js'
], function (Class, ToolKit) {

    return Class.extend({

        init: function (srcCanvas) {

            this.options = {
                color: 'rgb(255, 0, 0)',
                font: 'bold 16px Tahoma'
            };

            this.srcCanvas = srcCanvas;
            this.srcContext = srcCanvas.getContext('2d');

            // Add the temporary canvas.
            this.tmpCanvas = document.createElement('canvas');
            this.tmpCanvas.id = 'imageTemp';
            this.tmpCanvas.width = srcCanvas.width;
            this.tmpCanvas.height = srcCanvas.height;
            this.srcCanvas.parentNode.appendChild(this.tmpCanvas);

            this.tmpContext = this.tmpCanvas.getContext('2d');
            this.changeColor(this.options.color);

            this.toolKit = new ToolKit(this.tmpContext, this.tmpCanvas);
            this.tool = this.changeTool('pencil');
        },

        changeTool: function (toolName) {
            var tool = this.tool;
            tool && tool.destroy();
            tool = this.toolKit.create(toolName, this.options);
            tool.onFinalize.add(this.applyImage.bind(this));
            return tool;
        },

        changeColor: function (color) {
            this.tmpContext.strokeStyle = color;
        },

        setLineWidth: function (width) {
            this.tmpContext.lineWidth = parseInt(width, 10);
        },

        RepaintByScript: function (script) {
            var tmpContext = this.tmpContext;
            var srcContext = this.srcContext;
            var tmpCanvas = this.tmpCanvas;

            tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            srcContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            this.tool.started = false;
            srcContext.drawImage(tmpCanvas, 0, 0);
            tmpContext.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height);
            eval(script);
        },

        applyImage: function () {
            var tc = this.tmpCanvas;
            this.srcContext.drawImage(tc, 0, 0);
            this.tmpContext.clearRect(0, 0, tc.width, tc.height);
        }
    });
});