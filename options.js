// Saves options to localStorage.

var props = [
    'domain',
    'login',
    'password'
];

function save_options() {

    for (var i = 0; i < props.length; i++) {
        var p = props[i];
        settings.set_prop(p, $('#' + p).val());
    }

    // Update status to let user know options were saved.
    var $status = $('#status');
    $status.html('Options Saved!');
    setTimeout(function () {
        $status.html('');
    }, 2000);

}

function restore_options() {

    for (var i = 0; i < props.length; i++) {
        var p = props[i];
        var val = settings.get_prop(p);
        $('#' + p).val(val);
    }
}

$(function () {
    restore_options();
    $('#save').click(save_options);
});