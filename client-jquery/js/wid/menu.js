/**
 * Constructor for the Menu widget
 * @constructor
 */
yadnss.wid.Menu = function(){
    var self = this;
    /**
     * The associated jquery DOM element
     * @member {jQuery}
     */
    self.$element = $(self.template);

    self.$element.find('.menu-copy').click(function(event) {
        self.$element.find('input').select();
    });
};

/**
 * Base html template that will be inserted into DOM
 * @member {string}
 * @memberof SkillIcon
 */
yadnss.wid.Menu.prototype.template =
    '<div class="input-group">' +
        '<span class="input-group-addon">Build URL</span>' +
        '<input class="form-control" type="text" value=""></input>' +
        '<span class="input-group-btn">' +
            '<button class="btn btn-default menu-copy" type="button" title="Select URL">' +
                '<i class="icon-paper-clip icon-large"></i>' +
            '</button>' +
            '<button class="btn btn-default dropdown-toggle menu-download" data-toggle="dropdown" type="button" title="Download as picture">' +
                '<i class="icon-download icon-large"></i>' +
            '</button>' +
            '<ul class="dropdown-menu" role="menu">' +
                '<li><a href="#" class="a-portrait">Portrait</a></li>' +
                '<li><a href="#" class="a-landscape">Landscape</a></li>' +
            '</ul>' +
        '</span>' +
    '</div>';

/**
 * Calculates the current build hash and updates the build url bar
 * @method
 * @memberof Menu
 * @param {iterable[model.SkillLevel]} jobs - iterable of Jobs
 * @param {number} level - character level
 * @returns {Menu}
 */
yadnss.wid.Menu.prototype.update = function(jobs, level) {
    var hash = '/' + build.hash_build(jobs) + '.' + build.hash_job(_.last(jobs), level);
    this.$element.find('input').val(window.location.origin + hash);
    this.$element.find('a-portrait').val('/portrait' + hash);
    this.$element.find('a-landscape').val('/landscape' + hash);
    return this;
};