/**
 * Module for parsing json responses
 * @namespace
 */
var model = (function () {
    /** @ignore */
    var self = {};
   
    /**
     * Represents a character job, but is really just
     * a container for Skill objects.
     * @constructor
     * @memberof model
     * @name Job
     * @param {object} obj - Json object received
     */
    self.Job = function(obj) {//{{{
        var o = obj.fields;

        /**
         * @memberof model.Job
         * @member {number} id
         * @instance
         */
        this.id = obj.pk;

        /**
         * @memberof model.Job
         * @member {string} name
         * @instance
         */
        this.name = o.name;

        /**
         * @member {number} index
         * @memberof model.Job
         * @instance
         */
        this.index = o.number;

        /**
         * @member {Job} parent
         * @memberof model.Job
         * @instance
         */
        this.parent = null;
        if (o.parent !== null) {
            this.parent = self.job_byid[o.parent];
        }

        /**
         * Array of associated skills, indexed by
         * position in the skill grid.
         * @member {Skill[]}
         * @memberof model.Job
         * @instance
         */
        this.skill = [];
    };//}}}

    /**
     * Represents a skill object
     * @constructor
     * @name Skill
     * @memberof model
     * @param {object} obj - Json object received
     */
    self.Skill = function(obj) {//{{{
        var n;
        var o = obj.fields;

        /**
         * @member {number} id
         * @memberof model.Skill
         * @instance
         */
        this.id = obj.pk;

        /**
         * @member {Job} job
         * @memberof model.Skill
         * @instance
         */
        this.job = self.job_byid[o.job];

        /**
         * @member {string} name
         * @memberof model.Skill
         * @instance
         */
        this.name = o.name;

        /**
         * @member {string} description
         * @memberof model.Skill
         * @instance
         */
        this.description = o.description;

        /**
         * The icon id where
         * icon / 100 is the iconmap filename 
         * icon % 100 is the position in the map
         * @member {number} icon
         * @memberof model.Skill
         * @instance
         */
        this.icon = o.icon;

        /**
         * Array of SkillLevel objects representing
         * the unlock requirements for this skill.
         * @member {SkillLevel[]} req_slevel
         * @memberof model.Skill
         * @instance
         */
        this.req_slevel = [];

        /**
         * Array whose n-th element represents the
         * required sp investment in the n-th job
         * to unlock this skill.
         * @member {number[]} req_sp
         * @memberof model.Skill
         * @instance
         */
        this.req_sp = [];
        for (n=0; o.hasOwnProperty('sp_required_'+n); n++) {
            this.req_sp[n] = o['sp_required_'+n];
        }

        /**
         * The position on the skill grid beginnning
         * with 0 at the upper-left and incrementing
         * from left to right then top to bottom.
         * @member {number} index
         * @memberof model.Skill
         * @instance
         */
        this.index = o.tree_index;

        /**
         * @member {number} level
         * @memberof model.Skill
         * @instance
         */
        this.level = 0;

        /**
         * @member {number} maxlevel
         * @memberof model.Skill
         * @instance
         */
        this.maxlevel = 0;

        /**
         * Array containing associated SkillLevels
         * indexed by their level
         * @member {SkillLevel[]} slevels
         * @memberof model.Skill
         * @instance
         */
        this.slevels = [];

        /** 
         * @member {boolean} ultimate
         * @memberof model.Skill
         * @instance
         */
        this.ultimate = o.ultimate;
    };//}}}

    /**
     * Increments the skill level by a given amount.
     * Pass a negative argument to decrease the level.
     * The skill will be set to the nearest valid level.
     * @instance
     * @method increment
     * @memberof model.Skill
     * @param {number} num - amount to increase level by
     * @returns {Skill}
     */
    self.Skill.prototype.increment = function (num) {
        this.level = this.level + num;
        this.validate_level();
        return this;
    };

    /**
     * Ensures level is within appropriate range and
     * an associated SkillLevel exists.
     * @instance
     * @method validate_level
     * @memberof model.Skill
     * @returns {Skill}
     */
    self.Skill.prototype.validate_level = function () {
        this.level = this.level < 0 ? 0 : this.level;
        this.level = this.level > this.maxlevel ? this.maxlevel : this.level;
        if (this.slevels[this.level] === undefined && this.level !== 0) {
            throw new ReferenceError('Associated SkillLevel not found');
        }
        return this;
    };

    /**
     * Gets the currently associated skill level.
     * Returns undefined if level === 0
     * @instance
     * @method current
     * @memberof model.Skill
     * @return {SkillLevel}
     */
    self.Skill.prototype.current = function() {
        return this.slevels[this.level];
    };

    /**
     * Gets the next associated skill level
     * Returns undefined if no further level exists
     * @instance
     * @method next
     * @memberof model.Skill
     * @return {SkillLevel}
     */
    self.Skill.prototype.next = function() {
        return this.slevels[this.level + 1];
    };

    /**
     * Gets the cumulative sp cost of the current level
     * @instance
     * @method sp_cost
     * @memberof model.Skill
     * @return {number}
     */
    self.Skill.prototype.sp_cost = function() {
        if (this.current()) {
            return this.current().sp_cost_cumulative;
        }
        return 0;
    };


    /**
     * Represents a skill level. If the constructed SkillLevel is a default
     * skill, that is `(req_level == 1 && sp_cost == 0)`, the parent skill
     * object will have its level set to 1.
     * @constructor
     * @name SkillLevel
     * @memberof model
     * @param {object} obj - Json object received
     */
    self.SkillLevel = function(obj) {//{{{
        var descpvp, descpve, paramspve, paramspvp, n;
        var o = obj.fields;

        /**
         * @member {number} id
         * @memberof model.SkillLevel
         * @instance
         */
        this.id = obj.pk;

        /**
         * @member {number} level
         * @memberof model.SkillLevel
         * @instance
         */
        this.level = o.level;

        /**
         * @member {number} required_level
         * @memberof model.SkillLevel
         * @instance
         */
        this.req_level = o.required_level;

        /**
         * @member {Skill} skill
         * @memberof model.SkillLevel
         * @instance
         */
        this.skill = self.skill_byid[o.skill];

        /**
         * @member {number} sp_cost
         * @memberof model.SkillLevel
         * @instance
         */
        this.sp_cost = o.sp_cost;

        /**
         * @member {number} sp_cost_cumulative
         * @memberof model.SkillLevel
         * @instance
         */
        this.sp_cost_cumulative = o.sp_cost_cumulative;

        /**
         * @member {number} mp_cost_pve
         * @memberof model.SkillLevel
         * @instance
         */
        this.mp_cost_pve = o.mp_cost_pve;

        /**
         * @member {number} mp_cost_pvp
         * @memberof model.SkillLevel
         * @instance
         */
        this.mp_cost_pvp = o.mp_cost_pvp;

        /**
         * @member {number} cooldown_pve
         * @memberof model.SkillLevel
         * @instance
         */
        this.cooldown_pve = o.cooldown_pve;

        /**
         * @member {number} cooldown_pvp
         * @memberof model.SkillLevel
         * @instance
         */
        this.cooldown_pvp = o.cooldown_pvp;

        descrpve = this.skill.description;
        descrpvp = this.skill.description;
        paramspve = obj.fields.description_params_pve.split(',');
        paramspvp = obj.fields.description_params_pvp.split(',');
        for (n in paramspve) {
            descrpve = descrpve.replace('{'+n+'}', paramspve[n]);
            descrpvp = descrpvp.replace('{'+n+'}', paramspvp[n]);
        }

        /**
         * @member {string} description_pve
         * @memberof model.SkillLevel
         * @instance
         */
        this.description_pve = descrpve;

        /**
         * @member {string} description_pvp
         * @memberof model.SkillLevel
         * @instance
         */
        this.description_pvp = descrpvp;

        // Autoset skill to level1 if this is default slevel
        if (this.req_level == 1 && this.sp_cost == 0) { this.skill.level = 1; }
    };//}}}
    
    /**
     * Get the MP cost
     * @method
     * @memberof model.SkillLevel
     * @param {boolean} pve - if true, return the pve value
     * @return {number}
     */
    self.SkillLevel.prototype.get_mp_cost = function (pve) {
        return (pve ? this.mp_cost_pve : this.mp_cost_pvp);
    };

    /**
     * Get the Cooldown
     * @method
     * @memberof SkillLevel
     * @param pve {boolean} - if true, return the pve value
     * @return {number}
     */
    self.SkillLevel.prototype.get_cooldown = function (pve) {
        return (pve ? this.cooldown_pve : this.cooldown_pvp);
    };

    /**
     * Get the MP cost
     * @method
     * @memberof SkillLevel
     * @param pve {boolean} - if true, return the pve value
     * @return {string}
     */
    self.SkillLevel.prototype.get_description = function (pve) {
        return (pve ? this.description_pve : this.description_pvp);
    };

    /**
     * Array containing Job instances indexed by id
     * @member {Job[]}
     * @memberof model
     */
    self.job_byid = [];

    /**
     * Array containing Job instances indexed by job index
     * @member {Job[]}
     * @memberof model
     */
    self.job_byindx = [];

    /**
     * Array containing Skill instances indexed by id
     * @member {Skill[]}
     * @memberof model
     */
    self.skill_byid = [];

    /**
     * Array containing SkillLevel instances indexed by id
     * @member {Job[]}
     * @memberof model
     */
    self.slevel_byid = [];

    /**
     * Function for parsing an ajax response with skill information
     * @method
     * @memberof model
     * @param {object[]} response - array of objects in response
     * @param {number} char_level - level of represented character
     * @returns {model}
     */
    self.parse = function(response, char_level) {//{{{
        var job, skill, slevel, obj, n;
        var description = {};
        var parent = [];

        for (n in response) {
            obj = response[n];
            switch (obj.model) {
                case "skills.job":
                    job = new self.Job(obj);
                    self.job_byid[job.id] = job;
                    self.job_byindx[job.index] = job;
                    break;
                case "skills.skill":
                    skill = new self.Skill(obj);
                    skill.job.skill[skill.index] = skill;
                    self.skill_byid[skill.id] = skill;
                    // These may depend on yet unparsed objects
                    for (n=1; n<4; n++) {
                        if (obj.fields['parent_'+n] !== null) { 
                            parent.push({ 
                                'skill_id': obj.pk, 
                                'slevel':obj.fields['parent_'+n] 
                            });
                        }
                    }
                    break;
                case "skills.skilllevel":
                    slevel = new self.SkillLevel(obj);
                    slevel.skill.slevels[slevel.level] = slevel;
                    self.slevel_byid[slevel.id] = slevel;
                    if (slevel.level > slevel.skill.maxlevel && slevel.req_level <= char_level) {
                        slevel.skill.maxlevel = slevel.level;
                    }
                    break;
                default:
                    break;
            }
        }

        for (n in parent) {
            skill = self.skill_byid[parent[n].skill_id];
            skill.req_slevel.push(self.slevel_byid[parent[n].slevel]);
        }

        return self;
    };//}}}
    
    return self;
})();

