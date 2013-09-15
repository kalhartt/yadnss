Polymer('skill-icon', {
    level: 0,
    skill: null,
    static_base: '',

    set_skill: function(skill, static_base){
        this.skill = skill;
        this.static_base = static_base;
        this.shadowRoot.querySelector('img').src = sprintf('%simg/lo/%s.png', this.static_base, skill.icon);
        this.shadowRoot.querySelector('img').id = skill.id;
        this.update(0);
    },

    set_hi: function(){
        this.shadowRoot.querySelector('img').src = sprintf('%simg/hi/%s.png', this.static_base, this.skill.icon);
    },

    set_lo: function(){
        this.shadowRoot.querySelector('img').src = sprintf('%simg/lo/%s.png', this.static_base, this.skill.icon);
    },

    set_handle: function(click, context, hover){
        var img = this.shadowRoot.querySelector('img');
        img.addEventListener('mousedown', function(e) {
            switch (e.which){
                case 1:
                    click(e);
                    break;
                case 3:
                    context(e);
                    break;
            }
            return False;
        });
        img.addEventListener('contextmenu', function(e) {e.preventDefault();});
        img.addEventListener('mouseover', hover);
    },

    update: function(level) {
        this.level = level;
        if (this.level > 0) { this.set_hi(); } else { this.set_lo(); }
        this.shadowRoot.querySelector('span').innerHTML = sprintf('%d/%d', level, this.skill.numlevel);
    }

});
