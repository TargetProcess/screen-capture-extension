function setScreenshotUrl(url) {
    // document.getElementById('target').src = url;
    var canvas = document.getElementById('imageView');
    var context = canvas.getContext('2d');

    var image = new Image();
    image.onload = function() {
        canvas.width = image.width;
        canvas.height = image.height;
        // FIXME canvas size
        context.drawImage(image, 0, 0);
        image.onload = null;
    };
    image.src = url;
}
