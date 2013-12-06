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

            this.toolKit = new ToolKit(
                this.tmpContext,
                this.tmpCanvas,
                this.srcContext,
                this.srcCanvas
            );
            this.changeTool('pencil');
        },

        changeTool: function (toolName) {
            var tool = this.tool;
            tool && tool.destroy();
            this.tool = this.toolKit.create(toolName, this.options);
            return this.tool;
        },

        changeColor: function (color) {
            this.options.color = color;
            this
                .tmpCanvas
                .getContext('2d')
                .strokeStyle = color;
        },

        setLineWidth: function (width) {
            this
                .tmpCanvas
                .getContext('2d')
                .lineWidth = parseInt(width, 10);
        }
    });
});