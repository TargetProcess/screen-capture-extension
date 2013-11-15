function setScreenshotUrl(url) {
    // document.getElementById('target').src = url;

    var example = document.getElementById('imageView');
    var ctx = example.getContext('2d');
    var pic = new Image();
    pic.onload = function() {
        ctx.drawImage(pic, 0, 0);
    };
    pic.src = url;
}
