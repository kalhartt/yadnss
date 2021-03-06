/**
 * @namespace
 */
var yadnss = (function() {
    var self
    self = {};

    /**
     * Holds widget constructors
     * See wid/*.js
     * @namespace
     * @name wid
     * @memberof yadnss
     */
    self.wid = {};

    /**
     * Holds document objects defined by a layout
     * See layout/*.js
     * @namespace
     * @name doc
     * @memberof yadnss
     */
    self.doc = {};

    /**
     * jQuery Deferred object to allow async ajax calls
     * @member {Deferred} readyDeferred
     * @memberof yadnss
     * @instance
     */
    self.readyDeferred = $.Deferred();

    /**
     * RegExp match group extracing build from the window path.
     * buildhash[1] is the skill level hash and buildhash[2]
     * is the job hash.
     * @member {string[]} buildhash
     * @memberof yadnss
     * @instance
     */
    self.buildhash = /([a-zA-Z0-9-\_]+)\.([a-zA-Z0-9-\_]+)/.exec(window.location.pathname);
    if (self.buildhash === null) {
        self.jsonurl = '/api/';
        self.char_level = 60;
    } else {
        self.jsonurl = '/api/' + self.buildhash[2];
        self.char_level = build.unhash_job(self.buildhash[2])['level'];
    }

    /**
     * Initializes the document by generating widgets and attaching callbacks.
     * @method init
     * @memberof yadnss
     * @instance
     * @returns {yadnss}
     */
    self.init = function(){
        var jobs = model.job_byindx;
        if (self.buildhash !== null) { build.unhash_build(self.buildhash[1], jobs); }
        self.doc.init_elements();
        self.doc.points.
            set_labels(jobs).
            calc_sp_limit(jobs, self.char_level);
        $(document).
            on('SkillIcon.click', function (event, skill) {
                self.doc.info.update(skill);
                self.update(skill);
            }).
            on('SkillIcon.hover', function (event, skill) {
                self.doc.info.update(skill);
            });
        self.doc.level.
            set_job(_.last(jobs)).
            set_level(self.char_level);
        self.update();
        return self;
    };
    
    /**
     * Updates widgets in the view and calculates skill warnings.
     * @method update
     * @memberof yadnss
     * @instance
     * @returns {yadnss}
     */
    self.update = function(){
        var job_names, msg, warn_sp, warn_req, msg, ultimates, ult_pass;
        var jobs = model.job_byindx;
        var points = self.doc.points;
        var warn = self.doc.warning.clear();

        self.doc.menu.update(jobs, self.char_level);
        points.calc_sp_used(jobs);

        // SP limit validation
        job_names = _.map(jobs, function(job){ return job.name; }).concat(['Total']);
        _.each(job_names, function(name, index, job_names) {
            if (points.sp_used[index] > points.sp_limit[index]) {
                msg = warn.template_sp_limit({'job': name});
                warn.add(msg);
            }
        });

        // Skill validation
        warn_sp = [];
        warn_req = [];
        _.each(jobs, function(job, j_index, jobs) {
            // Does atleast one ultimate have every
            // requisite satisfied?
            ultimates = _.filter(job.skill, function(skill) { return skill.ultimate; });
            ult_pass = _.some(ultimates, function(skill) {
                return _.every(skill.req_slevel, function(slevel) {
                    return (slevel.level <= slevel.skill.level);
                });
            });

            _.each(job.skill, function(skill, s_index, skills) {
                if (skill.level === 0) { return; }

                // Check class sp requirements
                _.each(skill.req_sp, function(req_sp, n) {
                    if (req_sp <= self.doc.points.sp_used[n]) { return; }
                    msg = warn.template_skill_sp({
                        'job': job.name,
                        'sp': req_sp,
                        'skill': skill.name
                    });
                    warn.add(msg);
                });

                if (skill.ultimate && ult_pass) { return; }

                // Check skill requirements
                _.each(skill.req_slevel, function(slevel) {
                    if (slevel.level <= slevel.skill.level) { return; }
                    msg = warn.template_skill_req({
                        'req': slevel.skill.name,
                        'level': slevel.level,
                        'skill': skill.name
                    });
                    warn.add(msg);
                });

            });
        });

        return self;
    };

    return self;
})();

