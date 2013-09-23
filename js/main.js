var main = (function () {
    var self = {};
    
    self.alphabet = {};
    self.alphabet_reverse = {};
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

    var n = 0;
    for (var i=45; i<123; i++) {
        if (i == 46){ i = 48; }
        if (i == 58){ i = 65; }
        if (i == 91){ i = 95; }
        if (i == 96){ i = 97; }
        self.alphabet[n] = String.fromCharCode(i);
        self.alphabet_reverse[String.fromCharCode(i)] = n;
        n++;
    }

    self.hash = function(num, len) {//{{{
        console.debug("main.hash - enter");
        var result = '';
        while (num !== 0) {
            result += self.alphabet[num&63];
            num = num>>6;
        }
        if (result.length < len) { 
            result = result + new Array(1+len-result.length).join(self.alphabet[0]);
        }
        console.debug("main.hash - exit");
        return result;
    };//}}}

    self.unhash = function(msg) {//{{{
        console.debug("main.unhash - enter");
        var result = 0;
        for (var n=msg.length-1; n>=0; n--) {
            result = (result<<6) | self.alphabet_reverse[msg[n]];
        }
        console.debug("main.unhash - exit");
        return result;
    };//}}}

    self.hash_build = function() {//{{{
        console.debug("main.hash_build - enter");
        var n, i, slevel, skill;
        var result = '';
        var tmp = 0;
        var tmp_count = 0;
        for (n in model.job_byindx){
            for (i=0; i<24; i++){
                try {
                    skill = model.job_byindx[n].skill[i];
                    slevel = self.skill_grid[n].icon[skill.id].level;
                } catch (e) {
                    slevel = 0;
                }
                tmp = (tmp<<5)|slevel;
                tmp_count++;
                if (tmp_count == 6){
                    result += self.hash(tmp, 5);
                    tmp = 0;
                    tmp_count = 0;
                }
            }
        }
        console.debug("main.hash_build - exit");
        return result;
    };//}}}

    self.hash_job = function(job, level) {//{{{
        console.debug("main.hash_job - enter");
        var hash = self.hash(job.id<<7|level);
        console.debug("main.hash_job - exit");
        return hash;
    };//}}}

    self.unhash_build = function(message) {//{{{
        console.debug("main.unhash_build - enter");
        var n, i, level, skill, slevel;
        var msg = message.split('.')[0];
        var result = {};
        var num = 0;
        var count = 0;

        for (n in model.job_byindx[0].skill) {
            skill = model.job_byindx[0].skill[n];
            slevel = skill.level[1];
            if (slevel.req_level == 1 && slevel.sp_cost === 0) {
                result[skill.id] = 1;
            }
        }
        for (n in model.job_byindx){
            for (i=0; i<24; i++) {
                if (count%6 === 0) {
                    num = self.unhash(msg.slice(0,5));
                    msg = msg.slice(5);
                }
                level = num>>(25-(count%6)*5)&31;
                if (level>0) { result[model.job_byindx[n].skill[i].id] = level;}
                count++;
            }
        }
        console.debug("main.unhash_build - exit");
        return result;
    };//}}}

    self.unhash_job = function(message) {//{{{
        console.debug("main.unhash_job - enter");
        var msg = self.unhash(message.split('.')[1]);
        var result = { 'job':msg>>7 , 'level':msg&127 };
        console.debug("main.unhash_job - exit");
        return result;
    };//}}}

    self.init_elements = function() {//{{{
        console.debug("main - init_elements - enter");

        self.skill_points.set_labels(model.job_byindx, self.char_level);
        self.level_input.querySelector('.btn').addEventListener('click', self.level_reset);
        document.querySelector('.build-url-copy').addEventListener('click', function(){
            self.build_url.select();
        });

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

        var slevels = self.unhash_build(self.json_url);
        for (var skill_id in slevels){
            var level = slevels[skill_id];
            if (model.skill_byid.hasOwnProperty(skill_id) && model.skill_byid[skill_id].numlevel >= level) {
               self.skill_grid[model.skill_byid[skill_id].job.index].icon[skill_id].update(level);
            }
        }

        self.update();
        console.debug("main - init_elements - exit");
    };//}}}

    self.level_reset = function(e) {//{{{
        console.debug("main - level_reset - enter");
        var last_job = model.job_byindx[model.job_byindx.length-1];
        var level = parseInt(self.level_input.querySelector('.form-control').value, 10);
        level = level > 100 ? 100 : level;
        window.location = sprintf('%s/%s.%s', self.url_base, new Array(61).join('-'), self.hash_job(last_job, level));
        console.debug("main - level_reset - exit");
    };//}}}

    self.click = function(e) {//{{{
        console.debug("main - click - enter");
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        if (skill.numlevel > icon.level) {
            if (e.shiftKey | e.ctrlKey){
                icon.update(skill.numlevel);
            } else {
                icon.update(icon.level+1);
            }
            self.skill_info.update(skill, icon.level);
            self.update();
        }
        console.debug("main - click - exit");
    };//}}}

    self.context = function(e) {//{{{
        console.debug("main - context - enter");
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        if (icon.level > 0) {
            if (e.shiftKey | e.ctrlKey){
                icon.update(0);
            } else {
                icon.update(icon.level-1);
            }
            self.skill_info.update(skill, icon.level);
            self.update();
        }
        console.debug("main - context - exit");
    };//}}}

    self.hover = function(e) {//{{{
        console.debug("main - hover - enter");
        e.preventDefault();
        var skill = model.skill_byid[e.target.id];
        var icon = self.skill_grid[skill.job.index].icon[skill.id];
        self.skill_info.update(skill, icon.level);
        console.debug("main - hover - exit");
    };//}}}

    self.update = function() {//{{{
        console.debug("main - update - enter");
        var n, i, req, flt, job, skill, slevel, icon;
        var slevels = [];
        var requisites = [];
        var ultimates;
        self.skill_warning.innerHTML = '';
        self.skill_grid.forEach(function(e) { slevels = slevels.concat(e.get_slevels()); });
        self.skill_points.calc_sp(slevels);

        // returns true if item satisfies req
        // item and req are model.SkillLevel objects
        flt = function(item, req) {
            if (item.skill.id != req.skill.id) {return false;}
            if (req.level > item.level) {return false;}
            return true;
        };

        console.debug('Validate Total SP Limit');//{{{
        var req_jobsp = [];
        var req_skill = [];
        if (self.skill_points.sp_used[self.skill_points.sp_used.length-1] > self.skill_points.sp_limit[self.skill_points.sp_used.length-1]){
            self.skill_warning.innerHTML += sprintf('<li>%s</li>', 'Total SP limit exceeded');
        }//}}}

        console.debug('Validate Job SP Limits');//{{{
        for (n in model.job_byindx) {
            if (self.skill_points.sp_used[n] > self.skill_points.sp_limit[n]){
                self.skill_warning.innerHTML += sprintf('<li>%s SP limit exceeded</li>', model.job_byindx[n].name);
            }
        }//}}}

        console.debug('Build Skill requisite list');//{{{
        for (n in slevels) {
            if (slevels[n].skill.ultimate) { continue; }
            for (i in slevels[n].skill.req_slevel){
                req = {
                    'skill': slevels[n].skill,
                    'req': slevels[n].skill.req_slevel[i]
                };
                requisites.push(req);
            }
        }//}}}

        console.debug('Validate Skills');//{{{
        for (n in slevels) {
            slevel = slevels[n];
            
            // remove satisfied requisites
            requisites = requisites.filter(function(item) {
                return !flt(slevel, item.req);
            });
            
            // Validate Class SP Requirements
            for (i in model.job_byindx){
                job = model.job_byindx[i];
                if (self.skill_points.sp_used[i] < slevel.skill.req_sp[i]){
                    self.skill_warning.innerHTML += sprintf('<li>%s SP total >= %d required for %s</li>', job.name, slevel.skill.req_sp[i], slevel.skill.name);
                }
            }

        }
        requisites.forEach(function(req) {
            self.skill_warning.innerHTML += sprintf('<li>%s level %d required for %s</li>', req.req.skill.name, req.req.level, req.skill.name);
        });//}}}

        console.debug('Validate Ultimates');//{{{
        ultimates = slevels.filter(function(item) { return item.skill.ultimate; });
        var valid = ultimates.some(function(item) {
            // only need to validate one ultimate
            // but validate every requirement of that ultimate
            return item.skill.req_slevel.every(function(sitem) {
                icon = main.skill_grid[sitem.skill.job.index].icon[sitem.skill.id];
                return icon.level >= sitem.level;
            });
        });
        if (!valid) {
            console.info(ultimates, valid);
            ultimates.forEach(function(ult) {
                ult.skill.req_slevel.forEach(function(req) {
                    self.skill_warning.innerHTML += sprintf('<li>%s level %d required for %s</li>', req.skill.name, req.level, ult.skill.name);
                });
            });
        }//}}}

        console.debug('Update Build URL');//{{{
        var last_job = model.job_byindx[model.job_byindx.length-1];
        var build_hash = self.hash_build();
        var job_hash = self.hash_job(last_job, self.char_level);
        self.build_url.value = sprintf('%s/%s.%s', self.url_base, build_hash, job_hash);
        document.querySelector('.a-portrait').setAttribute('href', sprintf('%s/portrait/%s.%s', self.url_base, build_hash, job_hash));
        document.querySelector('.a-landscape').setAttribute('href', sprintf('%s/landscape/%s.%s', self.url_base, build_hash, job_hash));//}}}

        console.debug("main - update - exit");
    };//}}}
 
    return self;
})();

document.addEventListener('WebComponentsReady', function() {//{{{
    console.debug("Event - WebComponentsReady - enter");
    main.url_base = window.location.origin;
    main.json_base = window.location.origin + '/api/';
    main.build_url = document.querySelector(".build-url");
    main.skill_points = document.querySelector("skill-points");
    main.skill_warning = document.querySelector('.skill-warning');
    main.skill_info = document.querySelector('skill-info');
    main.level_input = document.querySelector('#level-input');
    var ajax = document.querySelector("polymer-ajax");

    try {
        var url_pattern = new RegExp('^/[A-Za-z0-9\-_]{60}\.[A-Za-z0-9\-_]+$');
        if (!url_pattern.test(window.location.pathname)) { throw "Invalid build url"; }
        main.char_level = main.unhash_job(window.location.pathname).level;
        main.level_input.querySelector('.form-control').value = main.char_level;
        main.json_url = window.location.pathname.slice(1);
    } catch (e) {
        main.char_level = 60;
        main.json_url = '------------------------------------------------------------.wo-';
    }
    main.build_url.value = main.url_base + '/' + main.json_url;
    document.querySelector('.a-portrait').setAttribute('href', sprintf('%s/portrait/%s', main.url_base, main.json_url));
    document.querySelector('.a-landscape').setAttribute('href', sprintf('%s/landscape/%s', main.url_base, main.json_url));
    ajax.url = main.json_base + main.json_url;

    ajax.addEventListener("polymer-response", function(e) {
        model.parse(e.detail.response, main.char_level);
        main.init_elements();
    });
    ajax.go();
    console.debug("Event - WebComponentsReady - exit");
});//}}}
