Polymer('skill-info', {
    pve: true,
    skill: null,
    level: 0,
    color_codes: { '#w': '</span><span class="info-default">', '#y': '</span><span class="info-yellow">' },
    uistring: {
        'current': '<p>Current Level:</p>',
        'next': '<p>Next Level:</p>',
        'name': '<h2>%s</h2><hr>',
        'level': '<p><span class="info-orange">Skill Level: </span><span class="info-default">%d</span></p>',
        'cost': '<p><span class="info-orange">SP Cost: </span><span class="info-default">%d</span></p>',
        'reqlevel': '<p><span class="info-orange">Req Level: </span><span class="info-default">%d</span></p>',
        'reqskill': '<p><span class="info-orange">Req Skill: </span><span class="info-default">%s level %d</span></p>',
        'description': '<p><span class="info-default">%s</span></p>',
        'mp_cost': '<p><span class="info-orange">MP Cost: </span><span class="info-default">%.1f%%</span></p>',
        'cooldown': '<p><span class="info-orange">Cooldown: </span><span class="info-default">%.0f s</span></p>'
    },

    get_description: function(slevel) {//{{{
        console.debug('skill-info.get_description - enter');
        var description, rep;
        if (this.pve) {
            rep = slevel.description_pve.replace(/\\n/g, '<br>');
            description = sprintf(this.uistring['mp_cost'], slevel.mp_cost_pve);
            description += sprintf(this.uistring['cooldown'], slevel.cooldown_pve);
            description += sprintf(this.uistring['description'], rep);
        } else {
            rep = slevel.description_pve.replace(/\\n/g, '<br>');
            description += sprintf(this.uistring['description'], rep);
        }
        for (key in this.color_codes) {
            description = description.replace(new RegExp(key, 'g'), this.color_codes[key]);
        }
        console.debug('skill-info.get_description - exit');
        return description;
    },//}}}

    toggle: function() {//{{{
        console.debug("skill-info.toggle - enter");
        if (this.pve) {
            this.shadowRoot.querySelector('button').innerHTML = 'PvP';
        } else {
            this.shadowRoot.querySelector('button').innerHTML = 'PvE';
        }
        this.pve = !this.pve;
        this.update(this.skill, this.level);
        console.debug("skill-info.toggle - exit");
    },//}}}

    update: function(skill, level) {//{{{
        console.debug("skill-info.update - enter");
        if (skill === null) { return; }
        this.skill = skill;
        this.level = level;
        var body = this.shadowRoot.querySelector('.panel-body');
        slevel = [skill.level[level], skill.level[level+1]];

        body.innerHTML = sprintf(this.uistring['name'], skill.name) + sprintf(this.uistring['level'], level);
        if (slevel[1] !== undefined) {
            body.innerHTML += sprintf(this.uistring['cost'], slevel[1].sp_cost);
            body.innerHTML += sprintf(this.uistring['reqlevel'], slevel[1].req_level);
            for (n in slevel[1].skill.req_slevel) {
                body.innerHTML += sprintf(this.uistring['reqskill'], slevel[1].skill.req_slevel[n].skill.name, slevel[1].skill.req_slevel[n].level);
            }
        }
        body.innerHTML += '<hr>';
        if (slevel[0] !== undefined) { body.innerHTML += this.uistring['current']  + this.get_description(slevel[0]); }
        if (slevel[1] !== undefined) { body.innerHTML += this.uistring['next'] + this.get_description(slevel[1]); }
        console.debug("skill-info.update - exit");
    },//}}}

    clear: function() {//{{{
        console.debug("skill-info.clear - enter");
        this.shadowRoot.querySelector('.panel-body').innerHTML = '';
        console.debug("skill-info.clear - exit");
    }//}}}

});
