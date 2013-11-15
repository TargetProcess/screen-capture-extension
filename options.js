/*global settings*/

// Saves/restore options.

function saveOptions() {
    var options = $('.option');
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        settings.set_prop(option.id, option.value);
    }

    // Update status to let user know options were saved.
    var $status = $('#status');
    $status.html('Options saved!');
    setTimeout(function() {
        $status.html('');
    }, 2000);
}

function restoreOptions() {
    var options = $('.option');
    for (var i = 0; i < options.length; i++) {
        var option = options[i];
        option.value = settings.get_prop(option.id);
    }
}

$(function() {
    restoreOptions();
    $('#save').click(saveOptions);
});
