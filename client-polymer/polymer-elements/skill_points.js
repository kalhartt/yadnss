Polymer('skill-points', {
    sp_limit: [104, 107, 104, 167],
    sp_used: [0, 0, 0, 0],

    set_labels: function(jobs, level) {//{{{
        console.debug("skill-points - set_labels - enter");
        var body = this.shadowRoot.querySelector('.panel-body');
        body.innerHTML = '';
        for (var n in jobs) {
            body.innerHTML += sprintf('%s<span class="badge pull-right sp-badge-%s">0</span><br>', jobs[n].name, n);
        }
        this.shadowRoot.querySelector('.sp-badge-total').className = "badge pull-right sp-badge-total sp-badge-" + jobs.length;
        this.calc_sp_total(jobs, level);
        this.calc_sp([]);
        console.debug("skill-points - set_labels - exit");
    },//}}}

    calc_sp: function(slevels) {//{{{
        var n;
        console.debug("skill-points - calc_sp - enter");
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
        console.debug("skill-points - calc_sp - exit");
    },//}}}

    calc_sp_total: function(jobs, level) {//{{{
        console.debug("skill-points - calc_sp_total - enter");
        var n, sp_total;
        var w = [0.625, 0.644999980926514, 0.625]; // Taken from jobtable.dnt
        this.sp_limit = [];
        sp_total = level > 50 ? level * 2 + 47 : level * 3 - 3;
        if (jobs.length == 1) {
            this.sp_limit[0] = sp_total;
            this.sp_limit[1] = sp_total;
        } else {
            for (n in jobs) {
                this.sp_limit[n] = Math.floor(sp_total * w[n]);
            }
            this.sp_limit[jobs.length] = sp_total;
        }
        console.debug("skill-points - calc_sp_total - exit");
    },//}}}

    clear: function() {//{{{
        console.debug("skill-points - clear - enter");
        for (var n=0; n < this.sp_used.length; n++) { this.sp_used[n] = 0; }
        this.calc_sp([]);
        console.debug("skill-points - clear - exit");
    }//}}}

});
