/**
 * Creates a SkillGrid widget, a container
 * for skill-icons of a given Job.
 * @constructor
 */
yadnss.wid.SkillGrid = function(job){
    var body, x, y;
    var self = this;
    /**
     * The associated jQuery DOM element
     * @member {jQuery}
     */
    this.$element = $(this.template);

    /** @member {model.Job} */
    this.job = job;

    /**
     * Array of SkillIcons in the grid
     * indexed by skill.index
     * @member {SkillIcon}
     */
    this.icon = [];

    this.$element.find('h4').text(job.name);

    body = this.$element.find('.skill-grid')
    _.each(job.skill, function(skill, index, skills) {
        x = (3 - index % 4) * 60 + 10;
        y = Math.floor(index / 4) * 60 + 10;
        self.icon[index] = new yadnss.wid.SkillIcon(skill)
        self.icon[index].$element.appendTo(body).css({'top': y + 'px', 'right': x + 'px'});
    });
};

/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof SkillGrid
 */
yadnss.wid.SkillGrid.prototype.template =
    '<div class="panel panel-default">' +
        '<div class="panel-heading"><h4 class="panel-title"></h4></div>' +
        '<div class="panel-body"><span class="skill-grid"></span></div>' +
    '</div>';