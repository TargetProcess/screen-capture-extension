define(['Class'], function(Class) {
    'use strict';
    return Class.extend({

        init: function(toolManager) {
            this.toolManager = toolManager;
        },

        onRender: function() {
            this.$el.on('click', '.i-role-tool', function(e) {
                this.toolManager.changeTool($(e.currentTarget).data('name'));
            }.bind(this));

            this.$el.on('click', '.form-color', function(e) {
                this.toolManager.changeColor($(e.currentTarget).find(':checked').val());
            }.bind(this));
        }
    });
});
