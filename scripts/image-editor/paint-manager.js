define([
    '/scripts/libs/class.js',
    '/scripts/image-editor/tools.js'
], function (Class, ToolKit) {

    var CanvasWrapper = Class.extend({
        init: function(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext('2d');
        },

        resize: function(options) {
            this.canvas.width = options.width;
            this.canvas.height = options.height;

            this.context = this.canvas.getContext('2d');
        }
    });

    return Class.extend({

        init: function (srcCanvas, tmpCanvas, options) {

            this.toolKit = (new ToolKit(new CanvasWrapper(srcCanvas), new CanvasWrapper(tmpCanvas)))
                .setFont(options.font)
                .setColor(options.color)
                .setLine(options.line);

            this.changeTool('pencil');
        },

        changeTool: function (toolName) {
            (this.tool || { destroy: $.noop }).destroy();
            (this.tool = this.toolKit.create(toolName));
            return this.tool;
        },

        changeColor: function (color) {
            this.toolKit.setColor(color);
        },

        setLineWidth: function (width) {
            this.toolKit.setLine(width);
        }
    });
});