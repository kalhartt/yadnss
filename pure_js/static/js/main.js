var model = {};
document.addEventListener('WebComponentsReady', function() {
    var ajax = document.querySelector("polymer-ajax");
    ajax.addEventListener("polymer-response", function(e) { model.parse(e.detail.response); })
    ajax.go();
});
