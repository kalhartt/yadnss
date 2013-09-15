var main = (function () {
    var self = {};

    self.build_url;
    self.skill_points;
    self.skill_warning;
    self.skill_info;
    self.char_level;
    self.url_base;
    self.json_base;
    self.json_url;
    self.level_input;
    self.skill_grid = [];


    self.init_elements = function() {//{{{
        self.skill_points.set_labels(model.job_byindx);
        self.level_input.querySelector('.btn').addEventListener('click', self.level_reset);

        var accordion = document.querySelector("polymer-ui-accordion");
        for (var n in model.job_byindx) {
            var collapsible = document.createElement('polymer-ui-collapsible');
            collapsible.className = 'panel panel-default';

            var header = document.createElement('span');
            header.className = 'panel-heading polymer-ui-collapsible-header';
            header.innerHTML = model.job_byindx[n].name;

            var grid = document.createElement('skill-grid');
            grid.init(model.job_byindx[n], '/static/');
            grid.set_handle(self.click, self.context, self.hover);
            self.skill_grid.push(grid);

            collapsible.appendChild(header);
            collapsible.appendChild(grid);
            accordion.appendChild(collapsible);
        }

        var slevels = self.build_url.unhash_build(self.json_url);
        for (var skill_id in slevels){
            var level = slevels[skill_id];
            if (model.skill_byid.hasOwnProperty(skill_id) && model.skill_byid[skill_id].numlevel >= level) {
               self.skill_grid[model.skill_byid[skill_id].job.index].icon[skill_id].update(level);
            }
        }
    };//}}}

    self.level_reset = function(e) {//{{{
        var last_job = model.job_byindx[model.job_byindx.length-1]
        var level = parseInt(self.level_input.querySelector('.form-control').value);
        level = level > 100 ? 100 : level;
        window.location = sprintf('%s/%s.%s', self.url_base, new Array(61).join('-'), self.build_url.hash_job(last_job, level));
    }//}}}

    self.click = function(e) {//{{{
        e.preventDefault();
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        if (skill.numlevel > icon.level) {
            icon.update(icon.level+1);
            self.skill_info.update(skill, icon.level);
            self.update();
        }
    }//}}}

    self.context = function(e) {//{{{
        e.preventDefault();
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        if (icon.level > 0) {
            icon.update(icon.level-1);
            self.skill_info.update(skill, icon.level);
            self.update();
        }
    }//}}}

    self.hover = function(e) {//{{{
        e.preventDefault();
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        self.skill_info.update(skill, icon.level);
    }//}}}

    self.update = function() {//{{{
        var slevels = [];
        self.skill_warning.innerHTML = '';
        self.skill_grid.forEach(function(e) { slevels = slevels.concat(e.get_slevels()); })
        self.skill_points.calc_sp(slevels);

        var req_jobsp = [];
        var req_skill = [];
        if (self.skill_points.sp_used[self.skill_points.sp_used.length-1] > self.skill_points.sp_limit[self.skill_points.sp_used.length-1]){
            self.skill_warning.innerHTML += sprintf('<li>%s</li>', 'Total SP limit exceeded');
        }

        for (var n in model.job_byindx) {
            if (self.skill_points.sp_used[n] > self.skill_points.sp_limit[n]){ 
                self.skill_warning.innerHTML += sprintf('<li>%s SP limit exceeded</li>', model.job_byindx[n].name);
            }
        }

        for (var n in slevels) {
            var slevel = slevels[n];

            for (var i in model.job_byindx){
                var job = model.job_byindx[i]
                if (self.skill_points.sp_used[i] < slevel.skill.req_sp[i]){
                    self.skill_warning.innerHTML += sprintf('<li>%s SP total >= %d required for %s</li>', job.name, slevel.skill.req_sp[i], slevel.skill.name);
                }
            }
            for (var i in slevel.skill.req_slevel){
                var req_slevel = slevel.skill.req_slevel[i];
                var found = false;
                for (j in slevels) { if (slevels[j].skill == req_slevel.skill && slevels[j].level >= req_slevel.level) { found = true; break; }}
                if (found) {continue;}
                self.skill_warning.innerHTML += sprintf('<li>%s level %d required for %s</li>', req_slevel.skill.name, req_slevel.level, slevel.skill.name);
            }
        }
        
        var last_job = model.job_byindx[model.job_byindx.length-1]
        self.build_url.value = sprintf('%s/%s.%s', self.url_base, self.build_url.hash_build(), self.build_url.hash_job(last_job, self.char_level));
    }//}}}
    
    return self;
})();

document.addEventListener('WebComponentsReady', function() {//{{{
    main.url_base = window.location.origin;
    main.json_base = window.location.origin + '/api/';
    main.build_url = document.querySelector("build-url");
    main.skill_points = document.querySelector("skill-points");
    main.skill_warning = document.querySelector('.skill-warning');
    main.skill_info = document.querySelector('skill-info');
    main.level_input = document.querySelector('#level-input');
    var ajax = document.querySelector("polymer-ajax");

    try {
        var url_pattern = new RegExp('^/[A-Za-z0-9\-_]{60}\.[A-Za-z0-9\-_]+$');
        if (!url_pattern.test(window.location.pathname)) { throw "Invalid build url"; }
        main.char_level = main.build_url.unhash_job(window.location.pathname).level;
        main.level_input.querySelector('.form-control').value = main.char_level;
        main.json_url = window.location.pathname.slice(1);
    } catch (e) {
        main.char_level = 60;
        main.json_url = '------------------------------------------------------------.w9'
    }
    main.build_url.value = main.url_base + '/' + main.json_url;
    ajax.url = main.json_base + main.json_url;

    ajax.addEventListener("polymer-response", function(e) {
        model.parse(e.detail.response, main.char_level);
        main.init_elements();
    });
    ajax.go();
});//}}}
