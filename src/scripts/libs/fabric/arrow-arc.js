// http://jsfiddle.net/matthze/n5Lwj/
/*globals exports */
/*eslint no-underscore-dangle:0 */
(function(global) {

    'use strict';

    var fabric = global.fabric || (global.fabric = {});

    if (fabric.ArrowArc) {
        fabric.warn('fabric.ArrowArc is already defined');
        return;
    }

    /**
     * Arrow class
     * @class fabric.Arrow
     * @extends fabric.Line
     * @see {@link fabric.Arrow#initialize} for constructor definition
     */
    fabric.ArrowArc = fabric.util.createClass(fabric.Line, /** @lends fabric.Line.prototype */ {

        /**
         * Type of an object
         * @type String
         * @default
         */
        type: 'arrowArc',

        /**
         * @private
         * @param {CanvasRenderingContext2D} ctx Context to render on
         */
        _render: function(ctx) {

            // move from center (of virtual box) to its left/top corner
            // we can't assume x1, y1 is top left and x2, y2 is bottom right
            var xMult = (this.x1 <= this.x2) ? -1 : 1;
            var yMult = (this.y1 <= this.y2) ? -1 : 1;

            var mw = this.width / 2;
            var mh = this.height;

            var kw = this.width === 1 ? 0 : 1;
            var kh = this.height === 1 ? 0 : 1;

            var x0 = kw * xMult * mw;
            var y0 = kh * yMult * mh;

            var x1 = -1 * x0;
            var y1 = -1 * y0;

            if (x1 === x0 && y0 === y1) {
                return;
            }

            var qx = 0;
            var qy = (x1 - x0) / 8;
            var triangleWidth = 25;
            var triangleHeight = Math.sqrt(Math.pow(triangleWidth, 2) - Math.pow(triangleWidth / 2, 2)) + 5;

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(qx, qy, x1 - triangleWidth / 2, y1);
            this._renderStroke(ctx);
            ctx.save(); // do not remove, important for edit

            ctx.beginPath();
            ctx.translate(x1, y1 - 1);
            ctx.rotate( -10 * Math.PI / 180);

            ctx.setLineJoin('miter');
            ctx.setLineCap('miter');
            ctx.setLineWidth(1);
            ctx.lineWidth = 0;
            ctx.moveTo(0, 0);

            ctx.lineTo( -1 * triangleHeight, -1 * triangleWidth / 2);
            ctx.lineTo( -1 * triangleHeight, triangleWidth / 2);
            ctx.closePath();

            ctx.fillStyle = ctx.strokeStyle;
            ctx.fill();
            ctx.restore(); // do not remove, important for edit
        }
    });

    fabric.ArrowArc.fromObject = function(object) {
        var points = [object.x1, object.y1, object.x2, object.y2];
        return new fabric.ArrowArc(points, object);
    };

}(typeof exports !== 'undefined' ? exports : this));
