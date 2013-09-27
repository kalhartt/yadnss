/**
 * Creates a Skill Point ui widget
 * @constructor
 */
yadnss.wid.SkillPoints = function(){
    /**
     * The associated jquery DOM element
     * @member {jQuery}
     */
    this.$element = $(this.template);

    /**
     * Array whose n-th element represents the maximum
     * number of skill points allowed on the n-th job.
     * The last element is the maximum number of skill
     * points that can be spent in total.
     * @member {array}
     */
    this.sp_limit = [];

    /**
     * Array whose n-th element represents the number of
     * skill points spent on the n-th job. The last
     * element is the total number of skill points spent.
     * @member {array}
     */
    this.sp_used = [];
};


/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof SkillPoints
 */
yadnss.wid.SkillPoints.prototype.template =
    '<aside class="panel panel-default">' +
        '<div class="panel-heading">' +
            'SP Total<span class="badge pull-right sp-badge-total"></span>' +
        '</div>' +
        '<div class="panel-body"></div>' +
    '</aside>';

/**
 * _.template used to generate html that displays skill
 * points spent in a given job
 * @member {_.template}
 * @memberof SkillPoints
 * @param {string} name - Name of the job
 * @param {string} number - Job identifier (typically job index)
 */
yadnss.wid.SkillPoints.prototype.rowtemplate = _.template(
    '<%= name %><span class="badge pull-right sp-badge-<%= number %>">0</span><br>');

/**
 * _.template used to badge text
 * @member {_.template}
 * @memberof SkillPoints
 * @param {string} used
 * @param {string} limit 
 */
yadnss.wid.SkillPoints.prototype.badgetemplate = _.template(
    '<%= used %>/<%= limit %>');

/**
 * Sets labels for using the supplied job and rowtemplate
 * @method
 * @memberof SkillPoints
 * @param {iterable[model.Job]} jobs - iterable producing Job instances to use as labels
 * @returns {SkillPoints}
 */
yadnss.wid.SkillPoints.prototype.set_labels = function(jobs) {
    var self = this;
    var n, body;
    body = self.$element.children('.panel-body').empty();
    for (n in jobs) {
        var test = self.rowtemplate({'name': jobs[n].name, 'number': n});
        body.append(test);
    }
    return this;
};

/**
 * Calculates SP used for the given jobs and updates the widget
 * and document title
 * @method
 * @memberof SkillPoints
 * @param {iterable[model.SkillLevel]} jobs - iterable of Jobs
 * @returns {SkillPoints}
 */
yadnss.wid.SkillPoints.prototype.calc_sp_used = function(jobs) {
    var n, sp;
    var self = this;
    self.sp_used = [];
    self.sp_used[jobs.length] = 0;
    _.each(jobs, function (job, n, jobs) {
        sp = _.reduce(job.skill, function(mem, item){ return mem + item.sp_cost(); }, 0);
        self.sp_used[n] = sp;
        self.sp_used[jobs.length] += sp;
        $('.sp-badge-'+n).
            text(self.badgetemplate({'used': sp, 'limit': self.sp_limit[n]})).
            toggleClass('alert-danger', sp > self.sp_limit[n]);
    });
    $('.sp-badge-total').
        text(self.badgetemplate({
            'used': self.sp_used[jobs.length],
            'limit': self.sp_limit[jobs.length]})).
        toggleClass('alert-danger', self.sp_used[jobs.length] > self.sp_limit[jobs.length]);

    return this;
};

/**
 * Calculates SP limits for given jobs and character level
 * @method
 * @memberof SkillPoints
 * @param {iterable[model.SkillLevel]} jobs - iterable of Jobs
 * @param {number} level - character level
 * @returns {SkillPoints}
 */
yadnss.wid.SkillPoints.prototype.calc_sp_limit = function(jobs, level) {
    var self = this;
    var n, w, sp_total;
    w = [0.625, 0.644999980926514, 0.625]; // constants from jobtable.dnt
    sp_total = level > 50 ? level * 2 + 47 : level * 3 - 3;
    
    self.sp_limit = [];
    if (jobs.length == 1) {
        self.sp_limit[0] = sp_total;
        self.sp_limit[1] = sp_total;
    } else {
        for (n in jobs) {
            self.sp_limit[n] = Math.floor(sp_total * w[n]);
        }
        self.sp_limit[jobs.length] = sp_total
    }

    return this;
};