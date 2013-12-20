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
        selection: true,
        perPixelTargetFind: true,
        targetFindTolerance: 5
    });

    fabric.Image.fromURL(url, function(img) {
        var w = img.getWidth();
        var h = img.getHeight();
        fCanvas.setDimensions({
            width: w + 2,
            height: h + 2
        });
        fCanvas.setBackgroundImage(img);

        g_ready.resolve();
    });

/*
    var r = getRatio();
    var canvas = document.getElementById('imageView');

    var image = new Image();
    image.onload = function() {
        var w = image.width / r;
        var h = image.height / r;

        canvas.width = w;
        canvas.height = h;
        var context = canvas.getContext('2d');
        var scaleRatio = 1 / r;

        context.save();
        context.scale(scaleRatio, scaleRatio);
        context.drawImage(image, 0, 0);
        context.restore();

        // Add the temporary canvas.
        var tmpCanvas = canvas.cloneNode();
        tmpCanvas.id = 'imageTemp';
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        canvas.parentNode.appendChild(tmpCanvas);

        g_ready.resolve();

        image.onload = null;
    };
    image.src = url;
*/
}
