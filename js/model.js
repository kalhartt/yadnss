var model = (function () {
    var self = {};
    
    self.Job = function() {//{{{
        this.id = 0;
        this.index = 0;
        this.name = '';
        this.parent = null;
        this.skill = {};
        this.numskill = 0;
    };//}}}

    self.Skill = function() {//{{{
        this.id = 0;
        this.job = null;
        this.name = '';
        this.icon = 0;
        this.req_slevel = [];
        this.req_sp = [];
        this.index = 0;
        this.level = {};
        this.numlevel = 0;
    };//}}}

    self.SkillLevel = function() {//{{{
        this.id = 0;
        this.level = 0;
        this.description_pve = '';
        this.description_pvp = '';
        this.req_level = 0;
        this.skill = null;
        this.sp_cost = 0;
        this.sp_cost_cumulative = 0;
    };//}}}
    
    self.job_byid = {};
    self.job_byindx = [];
    self.skill_byid = {};
    self.slevel_byid = {};

    self.parse =function(response, char_level) {
        console.debug("model.parse - enter");
        var description = {};
        var parent = [];

        var parse_job = function(obj) {
            console.debug("model.parse.parse_job - enter");
            var job = new self.Job();
            job.id = obj.pk;
            job.name = obj.fields.name;
            job.parent = obj.fields.parent == null ? null : self.job_byid[obj.fields.parent];
            
            self.job_byid[job.id] = job;
            self.job_byindx.push(job);
            console.debug("model.parse.parse_job - exit");
        }

        var parse_skill = function(obj) {
            console.debug("model.parse.parse_skill - enter");
            description[obj.pk] = obj.fields.description;
            for (var n=1; n<4; n++) {
                if (obj.fields['parent_'+n] != null) { parent.push({ 'skill': obj.pk, 'slevel':obj.fields['parent_'+n] }); }
            }
            var skill = new self.Skill();
            skill.id = obj.pk;
            skill.job = self.job_byid[obj.fields.job];
            skill.name = obj.fields.name;
            skill.icon = obj.fields.icon;
            skill.index = obj.fields.tree_index;
            for (n=0; obj.fields.hasOwnProperty('sp_required_'+n); n++) {
                skill.req_sp.push(obj.fields['sp_required_'+n]);
            }

            skill.job.skill[skill.index] = skill;
            skill.job.numskill += 1;
            self.skill_byid[skill.id] = skill;
            console.debug("model.parse.parse_skill - exit");
        }

        var parse_slevel = function(obj, char_level) {
            console.debug("model.parse.parse_slevel - enter");
            var slevel = new self.SkillLevel();
            var pve_description = description[obj.fields.skill];
            var pvp_description = description[obj.fields.skill];
            var pve_params = obj.fields.description_params_pve.split(',');
            var pvp_params = obj.fields.description_params_pvp.split(',');
            for (var n in pve_params) {
                pve_description = pve_description.replace('{'+n+'}', pve_params[n]);
                pvp_description = pvp_description.replace('{'+n+'}', pvp_params[n]);
            }

            slevel.id = obj.pk;
            slevel.level = obj.fields.level;
            slevel.description_pve = pve_description;
            slevel.description_pvp = pvp_description;
            slevel.req_level = obj.fields.required_level;
            slevel.skill = self.skill_byid[obj.fields.skill];
            slevel.sp_cost = obj.fields.sp_cost;
            slevel.sp_cost_cumulative = obj.fields.sp_cost_cumulative;

            slevel.skill.level[slevel.level] = slevel;
            if (slevel.req_level <= char_level) { slevel.skill.numlevel += 1; }
            self.slevel_byid[slevel.id] = slevel;
            console.debug("model.parse.parse_slevel - exit");
        }

        for (var n in response) {
            var obj = response[n];
            switch (obj.model) {
                case "skills.job":
                    parse_job(obj); break;
                case "skills.skill":
                    parse_skill(obj); break;
                case "skills.skilllevel":
                    parse_slevel(obj, char_level); break;
            }
        }

        for (var n in parent) {
            var skill = self.skill_byid[parent[n].skill];
            skill.req_slevel.push(self.slevel_byid[parent[n].slevel]);
        }

        self.job_byindx.sort(function(a,b) { return a.id-b.id; });
        for (n in self.job_byindx) { self.job_byindx[n].index = n; }
        console.debug("model.parse - exit");
    };
    
    return self;
})();

