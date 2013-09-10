(function(scope) {

    //{{{ JOB
    scope.Job = function() {
      /**
       * The id of the job.
       *
       * @attribute id
       * @type number
       * @default 0
       */
      id: 0;
      /**
       * The job heirarchy level.
       *
       * @attribute index
       * @type number
       * @default 0
       */
      index: 0;
      /**
       * The job name.
       *
       * @attribute name
       * @type string 
       * @default ''
       */
      name: '';
      /**
       * Instance of parent job or null.
       *
       * @attribute parent
       * @type object
       * @default ''
       */
      parent: null;
      /**
       * Map of children skills indexed by skill.tree_index.
       *
       * @attribute skill
       * @type object
       * @default {}
       */
      skill: {};
      /**
       * The job name.
       *
       * @attribute name
       * @type string 
       * @default ''
       */
      name = '';
    }//}}}

    //{{{ Skill
    scope.Skill = function() {
      /**
       * The id of the job.
       *
       * @attribute id
       * @type number
       * @default 0
       */
      id: 0;
      /**
       * The parent job.
       *
       * @attribute job
       * @type object
       * @default null
       */
      job: null;
      /**
       * The skill name.
       *
       * @attribute name
       * @type string 
       * @default ''
       */
      name: '';
      /**
       * The icon id.
       *
       * @attribute icon
       * @type number
       * @default 0
       */
      icon: 0;
      /**
       * List of required skill levels.
       *
       * @attribute req_slevel
       * @type object
       * @default []
       */
      req_slevel: [];
      /**
       * List of required skill points by job.
       *
       * @attribute req_sp
       * @type object
       * @default []
       */
      req_sp: [];
      /**
       * The location of the skill in the skilltree.
       *
       * @attribute index
       * @type number
       * @default 0
       */
      index: 0;
      /**
       * List of related SkillLevel objects indexed by level
       *
       * @attribute level
       * @type object
       * @default []
       */
      level: [];
    }//}}}

    //{{{ SkillLevel
    scope.SkillLevel = function() {
      /**
       * The id of the slevel.
       *
       * @attribute id
       * @type number
       * @default 0
       */
      id: 0;
      /**
       * The level of the slevel.
       *
       * @attribute slevel
       * @type number
       * @default 0
       */
      slevel: 0;
      /**
       * The pve skill description.
       *
       * @attribute description_pve
       * @type string 
       * @default ''
       */
      description_pve: '';
      /**
       * The pvp skill description.
       *
       * @attribute description_pvp
       * @type string 
       * @default ''
       */
      description_pvp: '';
      /**
       * The required character level.
       *
       * @attribute req_level
       * @type number
       * @default 0
       */
      req_level: 0;
      /**
       * Parent skill.
       *
       * @attribute skill
       * @type object
       * @default null
       */
      skill: null;
      /**
       * The incremental skill point cost of the slevel.
       *
       * @attribute sp_cost
       * @type number
       * @default 0
       */
      sp_cost = 0;
      /**
       * The cumulative skill point cost of the slevel.
       *
       * @attribute sp_cost_cumulative
       * @type number
       * @default 0
       */
      sp_cost_cumulative = 0;
    }//}}}

    scope.job_byid = {};
    scope.job_byindx = [];
    scope.skill_byid = {};
    scope.slevel_byid = {};
    var description = {};
    var parent = [];

    scope.parse_job = function(obj) {
        var job = new scope.Job();
        job.id = obj.pk;
        job.name = obj.fields.name;
        job.parent = scope.job_byid[obj.fields.parent];
        job.skill = {};

        scope.job_byindx.push(job);
        return job;
    }

    scope.parse_skill = function(obj) {
        description[obj.pk] = obj.fields.description;
        if (obj.fields.parent_1 != null){
            parent.push({ 'skill':obj.pk, 'slevel':obj.fields.parent_1 });
        }
        if (obj.fields.parent_2 != null){
            parent.push({ 'skill':obj.pk, 'slevel':obj.fields.parent_3 });
        }
        if (obj.fields.parent_3 != null){
            parent.push({ 'skill':obj.pk, 'slevel':obj.fields.parent_3 });
        }
        var skill = new scope.Skill();
        skill.id = obj.pk;
        skill.job = scope.job_byid[obj.fields.job];
        skill.name = obj.fields.name;
        skill.icon = obj.fields.icon;
        skill.index = obj.fields.tree_index;
        skill.req_sp = [ obj.fields.sp_required_0, obj.fields.sp_required_1, obj.fields.sp_required_2 ];
        skill.req_slevel = [];
        skill.level = [];

        skill.job.skill[skill.index] = skill;
        return skill;
    }

    scope.parse_slevel = function(obj) {
        var slevel = new scope.SkillLevel();
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
        slevel.skill = scope.skill_byid[obj.fields.skill];
        slevel.sp_cost = obj.fields.sp_cost;
        slevel.sp_cost_cumulative = obj.fields.sp_cost_cumulative

        slevel.skill.level[slevel.level] = slevel;
        return slevel;
    }

    scope.parse = function(response) {
        for (var n in response) {
            var obj = response[n];
            switch (obj.model) {
                case "skills.job":
                    scope.job_byid[obj.pk] = scope.parse_job(obj);
                    break;
                case "skills.skill":
                    scope.skill_byid[obj.pk] = scope.parse_skill(obj);
                    break;
                case "skills.skilllevel":
                    scope.slevel_byid[obj.pk] = scope.parse_slevel(obj);
                    break;
            }
        }

        for (var n in parent) {
            var skill = scope.skill_byid[parent[n]['skill']];
            skill.req_slevel.push(scope.slevel_byid[parent[n]['slevel']]);
        }
        scope.job_byindx.sort( function(a,b) { return a.id-b.id} );
    }

})(model);
