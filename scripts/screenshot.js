function getRatio() {
    return (window.devicePixelRatio == 2) ? 2 : 1;
}

function setScreenshotUrl(url) {

    var r = getRatio();
    var canvas = document.getElementById('imageView');
    var context = canvas.getContext('2d');

    var image = new Image();
    image.onload = function() {
        var w = image.width * r;
        var h = image.height * r;

        canvas.width = w;
        canvas.height = h;
        context.drawImage(image, 0, 0);

        // Add the temporary canvas.
        var tmpCanvas = canvas.cloneNode();
        tmpCanvas.id = 'imageTemp';
        tmpCanvas.width = w;
        tmpCanvas.height = h;
        canvas.parentNode.appendChild(tmpCanvas);

        image.onload = null;
    };
    image.src = url;
}
