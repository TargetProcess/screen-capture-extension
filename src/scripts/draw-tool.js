define(['Class'], function(Class) {

    'use strict';

    return Class.extend({

        enable: function(options, fabricCanvas) {

            this.fabricCanvas = fabricCanvas;
            this.options = options;

            this.start = this.start.bind(this);
            this.move = this.move.bind(this);
            this.stop = this.stop.bind(this);

            this.subscriptions = {
                'custom:mousedown': this.start,
                'custom:mousemove': this.move,
                'custom:mouseup': this.stop
            };

            this.fabricCanvas.on(this.subscriptions);
        },

        disable: function() {
            this.fabricCanvas.off(this.subscriptions);
        },

        start: function() {},
        move: function() {},

        stop: function() {

            if (this.figure) {
                this.saveState();
            }
        },

        getState: function() {

            if (this.figure) {
                return this.figure;
            }
        },

        undo: function(state) {

            if (state) {
                this.fabricCanvas.remove(state);
            }
        }
    });

});
