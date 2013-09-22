Polymer('skill-grid', {
    icon: {},

    init: function(job, static_base) {//{{{
        console.debug("skill-grid.init - enter");
        this.icon = {};
        this.shadowRoot.innerHTML = '<img class="skill-grid-bg" src="' + static_base + 'img/bg/' + job.id + '.png">';
        for (var n in job.skill){
            var icon = document.createElement('skill-icon');
            icon.set_skill(job.skill[n], static_base);
            var posx = (3-n%4)*60+10;
            var posy = Math.floor(n/4)*60+10;
            icon.style.right = posx + 'px';
            icon.style.top = posy + 'px';
            this.shadowRoot.appendChild(icon);
            this.icon[job.skill[n].id] = icon;
        }
        console.debug("skill-grid.init - exit");
    },//}}}

    set_handle: function(click, context, hover) {//{{{
        console.debug("skill-grid.set_handle - enter");
        for (var n in this.icon) {
            this.icon[n].set_handle(click, context, hover);
        }
        console.debug("skill-grid.set_handle - exit");
    },//}}}

    get_slevels: function() {//{{{
        console.debug("skill-grid.get_slevels - enter");
        var result = [];
        for (var n in this.icon) {
            if (this.icon[n].level == 0) { continue; }
            result.push(this.icon[n].skill.level[this.icon[n].level]);
        }
        console.debug("skill-grid.get_slevels - exit");
        return result;
    }//}}}

});
