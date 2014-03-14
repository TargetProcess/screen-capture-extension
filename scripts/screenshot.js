function getRatio() {
    return (window.devicePixelRatio == 2) ? 2 : 1;
}

var g_ready = $.Deferred();

localStorage['image-backup-on'] = null;

function setScreenshotUrl(url) {

    localStorage['image-backup'] = url;
    localStorage['image-backup-on'] = 1;
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
        img.setWidth(w/dpxRatio);
        img.setHeight(h/dpxRatio);

        fCanvas.setDimensions({
            width: w / dpxRatio,
            height: h / dpxRatio
        });

        fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas));

        g_ready.resolve(fCanvas);
    });
}
