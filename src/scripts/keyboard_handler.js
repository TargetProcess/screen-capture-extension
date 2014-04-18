// Add a keyboard listener on keyup.
if (window == top) {
    window.addEventListener(
        'keyup',
        function keyListener(e) {
            if (e.ctrlKey && e.shiftKey && e.keyCode) {
                chrome
                    .extension
                    .sendRequest({ message: 'shortcut-is-fired', code: e.keyCode });
            }
        },
        false
    );
}