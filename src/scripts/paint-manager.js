define([
    'Class',
    './components/tools'
], function(Class, ToolKit) {

    'use strict';

    return Class.extend({

        init: function(fabricCanvas, options) {

            this.toolKit = (new ToolKit(fabricCanvas))
                .setFont(options.font)
                .setColor(options.color)
                .setLine(options.line);

            this.changeTool('pencil');
        },

        changeTool: function(toolName) {

            var tool = this.toolKit.create(toolName);

            if (tool) {
                if (this.tool) {
                    this.tool.destroy();
                }

                this.tool = tool;
                return this.tool;
            }
            return null;
        },

        changeColor: function(color) {
            this.toolKit.setColor(color);
        },

        setLineWidth: function(width) {
            this.toolKit.setLine(width);
        }
    });
});
