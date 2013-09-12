var build_url, skill_points, skill_warning, skill_info, char_level, url_base, json_base, json_url, level_input;
var skill_grid = [];

document.addEventListener('WebComponentsReady', function() {
    url_base = window.location.origin;
    json_base = 'http://localhost:8000/api/';
    build_url = document.querySelector("build-url");
    skill_points = document.querySelector("skill-points");
    skill_warning = document.querySelector('.skill-warning');
    skill_info = document.querySelector('skill-info');
    level_input = document.querySelector('#level-input');
    var ajax = document.querySelector("polymer-ajax");

    try {
        var url_pattern = new RegExp('^/[A-Za-z0-9\-_]{60}\.[A-Za-z0-9\-_]+$');
        if (!url_pattern.test(window.location.pathname)) { throw "Invalid build url"; }
        char_level = build_url.unhash_job(window.location.pathname).level;
        json_url = window.location.pathname.slice(1);
    } catch (e) {
        char_level = 60;
        json_url = '------------------------------------------------------------.w9'
    }
    build_url.value = url_base + '/' + json_url;
    ajax.url = json_base + json_url;

    ajax.addEventListener("polymer-response", function(e) {
        model.parse(e.detail.response, 60);
        init_elements();
    });
    ajax.go();
});

init_elements = function() {
    skill_points.set_labels(model.job_byindx);

    var accordion = document.querySelector("polymer-ui-accordion");
    for (var n in model.job_byindx) {
        var collapsible = document.createElement('polymer-ui-collapsible');
        collapsible.className = 'panel panel-default';

        var header = document.createElement('span');
        header.className = 'panel-heading polymer-ui-collapsible-header';
        header.innerHTML = model.job_byindx[n].name;

        var grid = document.createElement('skill-grid');
        grid.init(model.job_byindx[n], '/static/');
        grid.set_handle(click, context, hover);
        skill_grid.push(grid);

        collapsible.appendChild(header);
        collapsible.appendChild(grid);
        accordion.appendChild(collapsible);
    }

    var slevels = build_url.unhash_build(json_url);
    for (var skill_id in slevels){
        var level = slevels[skill_id];
        if (model.skill_byid.hasOwnProperty(skill_id) && model.skill_byid[skill_id].numlevel >= level) {
           skill_grid[model.skill_byid[skill_id].job.index].icon[skill_id].update(level);
        }
    }
};

level_reset = function() {
    var last_job = model.job_byindx[model.job_byindx.length-1]
    var level = parseInt(level_input.querySelector('.form-control').value);
    window.location = sprintf('%s/%s.%s', url_base, new Array(60).join('-'), build_url.hash_job(last_job, char_level));
}

click = function(e) {
    e.preventDefault();
    var skill = model.skill_byid[e.target.id];
    var icon = skill_grid[skill.job.index].icon[skill.id];
    if (skill.numlevel > icon.level) {
        icon.update(icon.level+1);
        skill_info.update(skill, icon.level);
        update();
    }
}

context = function(e) {
    e.preventDefault();
    var skill = model.skill_byid[e.target.id];
    var icon = skill_grid[skill.job.index].icon[skill.id];
    if (icon.level > 0) {
        icon.update(icon.level-1);
        skill_info.update(skill, icon.level);
        update();
    }
}

hover = function(e) {
    e.preventDefault();
    var skill = model.skill_byid[e.target.id];
    var icon = skill_grid[skill.job.index].icon[skill.id];
    skill_info.update(skill, icon.level);
}

update = function() {
    slevels = [];
    skill_warning.innerHTML = '';
    skill_grid.forEach(function(e) { slevels = slevels.concat(e.get_slevels()); })
    skill_points.calc_sp(slevels);

    req_jobsp = [];
    seq_skill = [];
    if (skill_points.sp_used[skill_points.sp_used.length-1] > skill_points.sp_limit[skill_points.sp_used.length-1]){
        skill_warning.innerHTML += sprintf('<li>%s</li>', 'Total SP limit exceeded');
    }

    for (n in model.job_byindx) {
        if (skill_points.sp_used[n] > skill_points.sp_limit[n]){ 
            skill_warning.innerHTML += sprintf('<li>%s SP limit exceeded</li>', model.job_byindx[n].name);
        }
    }

    for (n in slevels) {
        slevel = slevels[n];

        for (i in model.job_byindx){
            job = model.job_byindx[i]
            if (skill_points.sp_used[i] < slevel.skill.req_sp[i]){
                skill_warning.innerHTML += sprintf('<li>%s SP total >= %d required for %s</li>', job.name, slevel.skill.req_sp[i], slevel.skill.name);
            }
        }
        for (i in slevel.skill.req_slevel){
            var req_slevel = slevel.skill.req_slevel[i];
            var found = false;
            for (j in slevels) { if (slevels[j].skill == req_slevel.skill && slevels[j].level >= req_slevel.level) { found = true; break; }}
            if (found) {continue;}
            skill_warning.innerHTML += sprintf('<li>%s level %d required for %s</li>', req_slevel.skill.name, req_slevel.level, slevel.skill.name);
        }
    }
    
    var last_job = model.job_byindx[model.job_byindx.length-1]
    build_url.value = sprintf('%s/%s.%s', url_base, build_url.hash_build(), build_url.hash_job(last_job, char_level));
}
