yadnss.doc.init_elements = function() {
    var n, host;
    yadnss.doc.info = new yadnss.wid.SkillInfo();
    yadnss.doc.points = new yadnss.wid.SkillPoints();
    yadnss.doc.warning = new yadnss.wid.Warning();
    yadnss.doc.menu = new yadnss.wid.Menu();

    yadnss.doc.info.$element.appendTo('#aside_r');
    yadnss.doc.points.$element.appendTo('#aside_l');
    yadnss.doc.warning.$element.appendTo('#aside_l');
    yadnss.doc.menu.$element.insertAfter('nav');

    yadnss.doc.grid = [];
    host = '#accordion';
    $host = $(host);
    _.each(model.job_byindx, function(job, n, job_byindx) {
        yadnss.doc.grid[n] = new yadnss.wid.SkillGrid(job, host);
        yadnss.doc.grid[n].$element.appendTo($host).find('.panel-title').
            attr('data-parent', host).
            attr('data-toggle', 'collapse').
            attr('href', '#grid-'+n).
            addClass('accordion-toggle');
        yadnss.doc.grid[n].$element.find('.panel-body').
            wrap('<div id="grid-' + n + '" class="panel-collapse collapse"></div>');
        $host.append(yadnss.doc.grid[n].$element);
    });
    yadnss.doc.grid[0].$element.children('.panel-collapse').addClass('in');
};
