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



        var dpxRatio = window.devicePixelRatio;

        var xw = w * dpxRatio;
        var xh = h * dpxRatio;

        var c = fCanvas.getElement();

        fCanvas.setDimensions({
            width: w / dpxRatio,
            height: h / dpxRatio
        });

        // Scale the canvas up by two for retina
        c.setAttribute('width', xw);
        c.setAttribute('height', xh);

        // finally set the scale of the context
        c.getContext('2d').scale(dpxRatio, dpxRatio);



        fCanvas.setBackgroundImage(img, fCanvas.renderAll.bind(fCanvas));

        g_ready.resolve(fCanvas);
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
