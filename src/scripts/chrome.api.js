define([], function() {

    return {
        captureTab: function () {
            var $result = $.Deferred();
            chrome
                .tabs
                .captureVisibleTab(null, { format: 'png' }, function (base64str) {
                    (base64str) ? $result.resolve(base64str) : $result.reject();
                });

            return $result;
        },

        getCurrentTab: function() {
            var $result = $.Deferred();
            chrome
                .tabs
                .getSelected(null, $result.resolve);

            return $result;
        },

        createNewTab: function(url) {
            var $result = $.Deferred();
            chrome
                .tabs
                .create({ url: url }, $result.resolve);

            return $result;
        }
    };
});