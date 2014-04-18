/*globals fabric, Q */
define([
    './paint-manager',
    './components/toolbar'
], function(PaintManager, ToolbarComponent) {

    'use strict';

    var createCanvas = function(url) {

        var defer = Q.defer();

        var canvasId = 'imageView';

        var fCanvas = new fabric.Canvas(canvasId, {
            selection: false,
            skipTargetFind: true,
            perPixelTargetFind: true,
            targetFindTolerance: 5
        });

        fabric.Image.fromURL(url, function(img) {
            var w = img.getWidth();
            var h = img.getHeight();

            var dpxRatio = window.devicePixelRatio;

            var xw = w / dpxRatio;
            var xh = h / dpxRatio;

            img.setWidth(xw);
            img.setHeight(xh);

            fCanvas.setDimensions({
                width: xw,
                height: xh
            });

            fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas));

            defer.resolve(fCanvas);
        });

        return defer.promise;
    };

    var createToolManager = function(fabricCanvas) {

        var paintManager = new PaintManager(fabricCanvas, {
            font: 'bold 16px Tahoma',
            color: 'red',
            line: 1
        });

        paintManager.setLineWidth(3);
        return paintManager;
    };

    var initTools = function(toolManager) {
        var toolbar = new ToolbarComponent(toolManager);
        toolbar.$el = $('.tools');
        toolbar.onRender();
        return toolbar;
    };

    Q
        .when(createCanvas('/img/screen.png'))
        .then(createToolManager)
        .then(initTools);

    $('.i-role-tool-add .tools__trigger').click(function() {
        var $trigger = $(this);
        //- debugger;
        var $popover = $trigger.next();

        $popover.css('top', $trigger[0].getBoundingClientRect().top + 5);
        $popover.css('left', $trigger[0].getBoundingClientRect().right - 7);
        $popover.find('.arrow').css('top', 22);
        $popover.toggle();

        $popover.find('select').fancySelect();
    });

    $('.i-role-tool-color .tools__trigger').click(function() {
        var $trigger = $(this);
        //- debugger;
        var $popover = $trigger.next();

        $popover.css('top', $trigger[0].getBoundingClientRect().top - 37);
        $popover.css('left', $trigger[0].getBoundingClientRect().right - 7);
        $popover.find('.arrow').css('top', 59);
        $popover.toggle();
    });

    $('.i-role-tool-settings .tools__trigger').click(function() {
        var $trigger = $(this);
        //- debugger;
        var $popover = $trigger.next();
        //- debugger;
        //- $popover.css('top', 550);
        $popover.css('top', 'auto');
        $popover.css('bottom', 5);
        $popover.css('left', $trigger[0].getBoundingClientRect().right - 7);
        $popover.find('.arrow').css('top', 'auto');
        $popover.find('.arrow').css('bottom', '6px');
        $popover.toggle();
    });
});
