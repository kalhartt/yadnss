/**
 * Module for parsing json responses
 * @namespace
 */
var model = (function () {
    /** @ignore */
    var self = {};
   
    /**
     * Container for Skill objects
     * @constructor
     * @memberof model
     * @param {object} obj - Json object received
     */
    self.Job = function(obj) {//{{{
        var o = obj.fields;

        /** @member {number} */
        this.id = obj.pk;

        /** @member {string} */
        this.name = o.name;

        /** @member {number} */
        this.index = o.number;

        /** @member {Job} */
        this.parent = null;
        if (o.parent !== null) {
            this.parent = self.job_byid[o.parent];
        }

        /** @member {array[model.Skill]} */
        this.skill = [];
    };//}}}

    /**
     * Represents a skill object
     * @constructor
     * @memberof model
     * @param {object} obj - Json object received
     */
    self.Skill = function(obj) {//{{{
        var n;
        var o = obj.fields;

        /** @member {number} */
        this.id = obj.pk;

        /** @member {model.Job} */
        this.job = self.job_byid[o.job];

        /** @member {string} */
        this.name = o.name;

        /** @member {string} */
        this.description = o.description;

        /**
         * The icon id where
         * icon / 100 is the iconmap filename 
         * icon % 100 is the position in the map
         * @member {number}
         */
        this.icon = o.icon;

        /**
         * Array of SkillLevel objects representing
         * the unlock requirements for this skill.
         * @member {Array[model.SkillLevel]} 
         */
        this.req_slevel = [];

        /**
         * Array whose n-th element represents the
         * required sp investment in the n-th job
         * to unlock this skill.
         * @member {array[number]}
         */
        this.req_sp = [];
        for (n=0; o.hasOwnProperty('sp_required_'+n); n++) {
            this.req_sp[n] = o['sp_required_'+n];
        }

        /**
         * The position on the skill grid beginnning
         * with 0 at the upper-left and incrementing
         * from left to right then top to bottom.
         * @member {number}
         */
        this.index = o.tree_index;

        /** @member {number} */
        this.level = 0;

        /** @member {number} */
        this.maxlevel = 0;

        /**
         * Array containing associated SkillLevels
         * indexed by their level
         * @member {array[SkillLevel]}
         */
        this.slevels = [];

        /** @member {boolean} */
        this.ultimate = o.ultimate;
    };//}}}

    /**
     * Increments the skill level by a given amount
     * @method
     * @methodof Skill
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
     * an associated SkillLevel exists
     * @method
     * @methodof Skill
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
     * Gets the currently associated skill level
     * Returns undefined if level === 0
     * @method
     * @methodof Skill
     * @return {SkillLevel}
     */
    self.Skill.prototype.current = function() {
        return this.slevels[this.level];
    };

    /**
     * Gets the next associated skill level
     * Returns undefined if no further level exists
     * @method
     * @methodof Skill
     * @return {SkillLevel}
     */
    self.Skill.prototype.next = function() {
        return this.slevels[this.level + 1];
    };

    /**
     * Gets the cumulative sp cost of the current level
     * @method
     * @methodof Skill
     * @return {number}
     */
    self.Skill.prototype.sp_cost = function() {
        if (this.current()) {
            return this.current().sp_cost_cumulative;
        }
        return 0;
    };


    /**
     * Represents a skill level
     * @constructor
     * @memberof model
     * @param {object} obj - Json object received
     */
    self.SkillLevel = function(obj) {//{{{
        var descpvp, descpve, paramspve, paramspvp, n;
        var o = obj.fields;

        /** @member {number} */
        this.id = obj.pk;

        /** @member {number} */
        this.level = o.level;

        /** @member {number} */
        this.req_level = o.required_level;

        /** @member {model.Skill} */
        this.skill = self.skill_byid[o.skill];

        /** @member {number} */
        this.sp_cost = o.sp_cost;

        /** @member {number} */
        this.sp_cost_cumulative = o.sp_cost_cumulative;

        /** @member {number} */
        this.mp_cost_pve = o.mp_cost_pve;

        /** @member {number} */
        this.mp_cost_pvp = o.mp_cost_pvp;

        /** @member {number} */
        this.cooldown_pve = o.cooldown_pve;

        /** @member {number} */
        this.cooldown_pvp = o.cooldown_pvp;

        descrpve = this.skill.description;
        descrpvp = this.skill.description;
        paramspve = obj.fields.description_params_pve.split(',');
        paramspvp = obj.fields.description_params_pvp.split(',');
        for (n in paramspve) {
            descrpve = descrpve.replace('{'+n+'}', paramspve[n]);
            descrpvp = descrpvp.replace('{'+n+'}', paramspvp[n]);
        }

        /** @member {string} */
        this.description_pve = descrpve;

        /** @member {string} */
        this.description_pvp = descrpvp;

        // Autoset skill to level1 if this is default slevel
        if (this.req_level == 1 && this.sp_cost == 0) { this.skill.level = 1; }
    };//}}}
    
    /**
     * Get the MP cost
     * @method
     * @memberof SkillLevel
     * @param pve {boolean} - if true, return the pve value
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
     * @member {array[model.Job]}
     * @memberof model
     */
    self.job_byid = [];

    /**
     * Array containing Job instances indexed by job index
     * @member {array[model.Job]}
     * @memberof model
     */
    self.job_byindx = [];

    /**
     * Array containing Skill instances indexed by id
     * @member {array[model.Skill]}
     * @memberof model
     */
    self.skill_byid = [];

    /**
     * Array containing SkillLevel instances indexed by id
     * @member {array[model.Job]}
     * @memberof model
     */
    self.slevel_byid = [];

    /**
     * Function for parsing an ajax response with skill information
     * @method
     * @memberof model
     * @param {array[obj]} response - array of objects in response
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

