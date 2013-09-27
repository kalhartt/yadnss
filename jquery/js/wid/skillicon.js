/**
 * Constructor for the Skill Icon widget
 * @constructor
 * @param {model.Skill} [skill] - if given, set_skill(skill) will be called
 */
yadnss.wid.SkillIcon = function(skill){
    var self = this;
    var $doc = $(document);
    /**
     * The associated jquery DOM element
     * @member {jQuery}
     */
    this.$element = $(this.template);

    /**
     * The associated <img> element
     * @member {jQuery}
     */
    this.$img = this.$element.find('img');

    /**
     * The associated badge
     * @member {jQuery}
     */
    this.$badge = this.$element.find('.badge');

    /**
     * The associated skill item
     * @member {model.Skill}
     */
    this.skill = null;

    /**
     * Root image path
     * @member {string}
     */
     this.static_base = '/static/img/'

    if (skill) { this.set_skill(skill); }

    this.$img.
        on('contextmenu', function() {return false;}).
        on('mousedown', function(event) {
            event.preventDefault();
            event.stopPropagation();
            switch (event.which) {
                case 1:
                    self.skill.increment((event.shiftKey||event.ctrlKey) ? 100 : 1);
                    break;
                case 3:
                    self.skill.increment((event.shiftKey||event.ctrlKey) ? -100 : -1);
                    break;
                default:
                    return false;
                    break;
            }
            $doc.trigger($.Event('SkillIcon.click'), skill);
            self.update();
            return false;
        }).
        on('mouseover', function(event) {
            $doc.trigger($.Event('SkillIcon.hover'), skill);
            return false;
        });
};

/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof SkillIcon
 */
yadnss.wid.SkillIcon.prototype.template =
    '<div class="skill-icon">' +
        '<span class="skill-img"><img></img></span>' +
        '<span class="badge"></span>' +
    '</div>';

/**
 * Sets the associated skill
 * @method
 * @memberof SkillIcon
 * @returns {SkillIcon}
 */
yadnss.wid.SkillIcon.prototype.set_skill = function (skill) {
	var x, y;
	this.skill = skill;
	this.$element.attr('id', 'skill-icon-' + this.skill.id);

    // Locate the icon in the imagemap file
	x = -50 * ((skill.icon % 100) % 10);
	y = -50 * (Math.floor((skill.icon % 100) / 10));
	this.$img.css('margin', y + 'px 0 0 ' + x + 'px');
	this.update();
	return this;
}

/**
 * Array of callbacks to perform when clicked. Functions
 * will be called with this.skill as the argument
 * @member {array[function]}
 * @memberof SkillIcon
 */
yadnss.wid.SkillIcon.prototype.hook_click = [];

/**
 * Array of callbacks to perform when hovered. Functions
 * will be called with this.skill as the argument
 * @member {array[function]}
 * @memberof SkillIcon
 */
yadnss.wid.SkillIcon.prototype.hook_hover = [];

/**
 * Updates the widget's display
 * @method
 * @memberof SkillIcon
 * @returns {SkillIcon}
 */
yadnss.wid.SkillIcon.prototype.update = function () {
	var icon = Math.floor(this.skill.icon / 100);
	icon = icon == 0 ? 1 : icon;
	this.$img.attr('src', this.static_base +
		(this.skill.level > 0 ? 'hi/' : 'lo/') +
		icon + '.png');
	this.$badge.text(this.skill.level + '/' + this.skill.maxlevel);
	return this;
};
