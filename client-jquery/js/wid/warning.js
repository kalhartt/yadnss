/**
 * Creates a Warning ui widget
 * @constructor
 */
yadnss.wid.Warning = function(){
	/**
	 * Associated jQuery DOM element
	 * @member {jQuery}
	 */
    this.$element = $(this.template);
};

/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof Warning
 */
yadnss.wid.Warning.prototype.template =
    '<div class="panel panel-default">' +
        '<div class="panel-heading">Warnings</div>' +
        '<div class="panel-body"><ul></ul></div>' +
    '</div>';

/**
 * @member {_.template}
 * @memberof Warning
 */
yadnss.wid.Warning.prototype.template_skill_sp =
	_.template('<%= job %> SP Total <%= sp %> required for <%= skill %>');

/**
 * @member {_.template}
 * @memberof Warning
 */
yadnss.wid.Warning.prototype.template_sp_limit =
	_.template('<%= job %> SP limit exceeded');

/**
 * @member {_.template}
 * @memberof Warning
 */
yadnss.wid.Warning.prototype.template_skill_req =
	_.template('<%= req %> level <%= level %> required for <%= skill %>');

/**
 * Removes all warnings
 * @method
 * @memberof Warning
 */
yadnss.wid.Warning.prototype.clear = function() {
	var self = this;
	self.$element.find('.panel-body').html('<ul></ul>');
	return this;
};

/**
 * Adds the given warning message(s)
 * @method
 * @memberof Warning
 * @param {(string|array[string])} message - Warning messages to add
 */
yadnss.wid.Warning.prototype.add = function(message) {
	var self = this;
	if (_.isArray(message)) {
		var msg = [];
		_each(message, function(item) {	msg.push('</li><li>', message);	});
		msg[0] = '<li>';
		msg[msg.length] = '</li>';
		self.$element.find('ul').append(msg.join(''));
	} else {
		self.$element.find('ul').append('<li>' + message + '</li>');
	}
	return this;
};
