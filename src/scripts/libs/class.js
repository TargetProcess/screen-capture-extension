/*eslint-disable*/
define([], function() {
    var initializing = false, fnTest = /xyz/.test(function() { xyz; }) ? /\b_super\b/ : /.*/;
    var Class = function() {};
    var objId = 0;
    var defaultProfiler = function(name, f){return f};
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        prototype.__profiler = prototype.__profiler || defaultProfiler;

        for (var name in prop) {
            if (name === '__profiler') continue;
            var propProxy = typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name]) ?
                    (function(name, fn) {
                        return function() {
                            var tmp = this._super;
                            this._super = _super[name];
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;
                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];

            prototype[name] = prototype.__profiler(name, propProxy);
        }

        function Class() {
            if (!initializing && this.init){
                this.__objectId = objId++;
                this.init.apply(this, arguments);
            }
        }

        Class.prototype = prototype;
        Class.constructor = Class;
        Class.extend = arguments.callee;

        return Class;
    };

    return Class;
});
