var model = {};
var skill_points;

connect_elements = function() {
    skill_points = document.querySelector("skill-points");
    skill_points.set_labels(model.job_byindx);
}

document.addEventListener('WebComponentsReady', function() {
    var ajax = document.querySelector("polymer-ajax");
    ajax.addEventListener("polymer-response", function(e) {
        model.parse(e.detail.response);
        connect_elements();
    });
});

