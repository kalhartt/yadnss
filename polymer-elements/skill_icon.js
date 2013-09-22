Polymer('skill-icon', {
    level: 0,
    skill: null,
    static_base: '',

    set_skill: function(skill, static_base){//{{{
        console.debug("skill-icon.set_skill - enter");
        this.skill = skill;
        this.static_base = static_base;
        this.shadowRoot.querySelector('.skill-icon-bg').src = sprintf('%simg/lo/back.png', this.static_base);
        this.shadowRoot.querySelector('.skill-icon-fg').src = sprintf('%simg/lo/%s.png', this.static_base, skill.icon);
        this.shadowRoot.querySelector('.skill-icon-fg').id = skill.id;
        this.update(0);
        console.debug("skill-icon.set_skill - exit");
    },//}}}

    set_hi: function(){//{{{
        console.debug("skill-icon.set_hi - enter");
        this.shadowRoot.querySelector('.skill-icon-fg').src = sprintf('%simg/hi/%s.png', this.static_base, this.skill.icon);
        console.debug("skill-icon.set_hi - exit");
    },//}}}

    set_lo: function(){//{{{
        console.debug("skill-icon.set_hi - enter");
        this.shadowRoot.querySelector('.skill-icon-fg').src = sprintf('%simg/lo/%s.png', this.static_base, this.skill.icon);
        console.debug("skill-icon.set_hi - exit");
    },//}}}

    set_handle: function(click, context, hover){//{{{
        console.debug("skill-icon.set_hi - enter");
        var img = this.shadowRoot.querySelector('.skill-icon-fg');
        img.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            switch (e.which){
                case 1:
                    click(e);
                    break;
                case 3:
                    context(e);
                    break;
                default:
                    break;
            }
            return false;
        });
        img.addEventListener('contextmenu', function(e) {e.preventDefault();});
        img.addEventListener('mouseover', hover);
        console.debug("skill-icon.set_hi - exit");
    },//}}}

    update: function(level) {//{{{
        console.debug("skill-icon.update - enter");
        this.level = level;
        if (this.level > 0) { this.set_hi(); } else { this.set_lo(); }
        this.shadowRoot.querySelector('span').innerHTML = sprintf('%d/%d', level, this.skill.numlevel);
        console.debug("skill-icon.update - exit");
    }//}}}

});
