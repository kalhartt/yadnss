Polymer('skill-points', {
    sp_limit: [104, 107, 104, 167],
    sp_used: [0, 0, 0, 0],

    set_labels: function(jobs) {
        var body = this.shadowRoot.querySelector('.panel-body');
        body.innerHTML = '';
        for (n in jobs) {
            body.innerHTML += jobs[n].name + '<span class="badge pull-right sp-badge-' + n + '">0</span><br>';
        }
        this.shadowRoot.querySelector('.sp-badge-total').className = "badge pull-right sp-badge-total sp-badge-" + jobs.length;
        this.calc_sp([]);
    },

    calc_sp: function(slevels) {
        this.sp_used = [];
        for (n=0; n < this.sp_limit.length; n++) { this.sp_used[n] = 0; }
        for (n in slevels) {
            slevel = slevels[n];
            this.sp_used[slevel.skill.job.index] += slevel.sp_cost_cumulative;
            this.sp_used[this.sp_used.length-1] += slevel.sp_cost_cumulative;
        }
        for (n=0; n < this.sp_limit.length; n++) {
            var badge = this.shadowRoot.querySelector('.sp-badge-'+n);
            badge.innerHTML = this.sp_used[n] + '/' + this.sp_limit[n];
            if (this.sp_used[n] > this.sp_limit[n]) {
                badge.className = "badge pull-right alert-danger sp-badge-" + n;
            } else {
                badge.className = "badge pull-right sp-badge-" + n;
            }
        }
    },

    clear: function() {
        for (n=0; n < this.sp_used.length; n++) { this.sp_used[n] = 0; }
        this.calc_sp([]);
    }
});
