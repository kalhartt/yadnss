Polymer('skill-icon', {
    level: 0,
    skill: null,
    static_base: '',

    set_skill: function(skill, static_base){//{{{
        console.debug("skill-icon.set_skill - enter");
        var img, icon, x, y;
        this.skill = skill;
        this.static_base = static_base;
        img = this.shadowRoot.querySelector('img');
        icon = Math.floor(skill.icon / 100);
        icon = icon === 0 ? 1 : icon;
        img.id = skill.id;
        x = -50*((skill.icon%100)%10);
        y = -50*(Math.floor((skill.icon%100)/10));
        img.style.margin = sprintf('%dpx 0 0 %dpx', y, x);
        this.update(0);
        console.debug("skill-icon.set_skill - exit");
    },//}}}

    set_hi: function(){//{{{
        console.debug("skill-icon.set_hi - enter");
        var icon = Math.floor(this.skill.icon / 100);
        icon = icon === 0 ? 1 : icon;
        this.shadowRoot.querySelector('img').src = sprintf('%simg/hi/%d.png', this.static_base, icon);
        console.debug("skill-icon.set_hi - exit");
    },//}}}

    set_lo: function(){//{{{
        console.debug("skill-icon.set_lo - enter");
        var icon = Math.floor(this.skill.icon / 100);
        icon = icon === 0 ? 1 : icon;
        this.shadowRoot.querySelector('img').src = sprintf('%simg/lo/%d.png', this.static_base, icon);
        console.debug("skill-icon.set_lo - exit");
    },//}}}

    set_handle: function(click, context, hover){//{{{
        console.debug("skill-icon.set_handle - enter");
        var img = this.shadowRoot.querySelector('img');
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
        console.debug("skill-icon.set_handle - exit");
    },//}}}

    update: function(level) {//{{{
        console.debug("skill-icon.update - enter");
        this.level = level;
        if (this.level > 0) { this.set_hi(); } else { this.set_lo(); }
        this.shadowRoot.querySelector('.badge').innerHTML = sprintf('%d/%d', level, this.skill.numlevel);
        console.debug("skill-icon.update - exit");
    }//}}}

});
