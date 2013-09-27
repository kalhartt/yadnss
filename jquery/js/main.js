$(document).ready(function() {
    yadnss.readyDeferred.resolve();
});
$.when($.ajax(yadnss.jsonurl), yadnss.readyDeferred).then(function(response) {
    model.parse(response[0], yadnss.char_level);
    yadnss.init();
});
