/**
 * Constructor for the Skill Info widget
 * @constructor
 */
yadnss.wid.SkillInfo = function(){
    /**
     * The associated jquery DOM element
     * @member {jQuery}
     */
    this.$element = $(this.template);

    /**
     * If true, widget will display PvE information
     * @member {boolean}
     */
     this.pve = true;

    /**
     * A dictionary of replacement key and values for descriptions
     * @member {object}
     */
     this.replace_codes = {
     	'\\\\n': '<br>',
     	'#w': '</span><span class="info-default">',
     	'#y': '</span><span class="info-yellow">'
     };

     /**
      * The currently displayed skill
      * @member {model.Skill}
      */
    this.skill = null;

	var self = this;
    this.$element.find('button').click(function() {self.toggle(self);});
};

/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof SkillInfo
 */
yadnss.wid.SkillInfo.prototype.template =
    '<div class="panel panel-default skill-info">' +
        '<div class="panel-heading">Skill Info' +
            '<button class="btn btn-default btn-xs pull-right">PvE</button>' +
        '</div>' +
        '<div class="panel-body"></div>' +
    '</div>';

/**
 * _.template for the info header
 * @member {_.template}
 * @memberof SkillInfo
 */
yadnss.wid.SkillInfo.prototype.template_head = 
	_.template(
		'<h2><%= skill.name %></h2>' +	
		'<p>Skill Level: <%= skill.level %></p>'
	);

/**
 * _.template for the next level requirements
 * @member {_.template}
 * @memberof SkillInfo
 */
yadnss.wid.SkillInfo.prototype.template_next = 
	_.template(
		'<hr>' +
		'<p><span class="info-orange">SP Cost: </span><span class="info-default"><%= slevel.sp_cost %></span></p>' +
		'<p><span class="info-orange">Req Level: </span><span class="info-default"><%= slevel.req_level %></span></p>' +
		'<% _.each(slevel.skill.req_slevel, function(item) {' +
			'return "<p><span class=\\"info-orange\\">Req Skill: </span><span class=\\"info-default\\">" + item.skill.name + " level " + item.level + "</span></p>"' +
		'}); %>'
	);

/**
 * _.template for the info body
 * @member {_.template}
 * @memberof SkillInfo
 */
yadnss.wid.SkillInfo.prototype.template_body = 
	_.template(
		'<hr><h3><%= curnxt %> Level</h3>' +
		'<p><span class="info-orange">MP Cost: </span><span class="info-default"><%= slevel.get_mp_cost(pve) %></span></p>' +
		'<p><span class="info-orange">Cooldown: </span><span class="info-default"><%= slevel.get_cooldown(pve) %></span></p>' +
		'<p><span class="info-orange"></span><span class="info-default">' +
			'<%= _.reduce(replace_codes, function (mem, val, key) { return mem.replace(RegExp(key, "g"), val) }, slevel.get_description(pve)) %>' + 
		'</span></p>'
	);

/**
 * Toggles PvE state
 * @method
 * @memberof SkillInfo
 * @param {SkillInfo} self - reference to containing skillinfo object
 * @returns {SkillInfo}
 */
yadnss.wid.SkillInfo.prototype.toggle = function(self) {
	self.pve = !self.pve;
	self.$element.find('button').text(self.pve ? 'PvE' : 'PvP');
	self.update(self.skill);
	return this;
};

/**
 * Updates the current information
 * @method
 * @memberof SkillInfo
 * @returns {SkillInfo}
 */
yadnss.wid.SkillInfo.prototype.update = function(skill) {
	var self = this;
	self.skill = skill;
	self.clear();
	if (!skill) { return this; }

	var info = [self.template_head({'skill': skill})];
	if (skill.next())	{ info.push(self.template_next({'slevel': skill.next()})); }
	if (skill.current()){ info.push(self.template_body({'slevel': skill.current(),	'replace_codes': self.replace_codes,	'curnxt': 'Current',	'pve': self.pve})); }
	if (skill.next())	{ info.push(self.template_body({'slevel': skill.next(),		'replace_codes': self.replace_codes,	'curnxt': 'Next',		'pve': self.pve})); }
	self.$element.find('.panel-body').html(info.join(''));
	return this;
};

/**
 * Clears the panel
 * @method
 * @memberof SkillInfo
 * @returns {SkillInfo}
 */
 yadnss.wid.SkillInfo.prototype.clear = function() {
 	var self = this;
	self.$element.find('.panel-body').empty();
	return this;
};