Polymer('build-url', {
    value: '',

    created: function() {
        this.alphabet = {};
        this.alphabet_reverse = {};

        var n = 0;
        for (var i=45; i<123; i++) {
            if (i == 46){ i = 48; }
            if (i == 58){ i = 65; }
            if (i == 91){ i = 95; }
            if (i == 96){ i = 97; }
            this.alphabet[n] = String.fromCharCode(i);
            this.alphabet_reverse[String.fromCharCode(i)] = n;
            n++;
        }

    },

    hash: function(num, len) {
        var result = '';
        while (num != 0) {
            result += this.alphabet[num&63];
            num = num>>6;
        }
        if (result.length < len) { result = result + new Array(1+len-result.length).join(this.alphabet[0]) }
        return result;
    },

    unhash: function(msg) {
        var result = 0;
        for (var n=msg.length-1; n>=0; n--) {
            result = (result<<6) | this.alphabet_reverse[msg[n]];
        }
        return result;
    },

    hash_build: function() {
        var result = '';
        var tmp = 0;
        var tmp_count = 0;
        for (var n in model.job_byindx){
            for (var i=0; i<24; i++){
                try {
                    var skill = model.job_byindx[n].skill[i];
                    var slevel = main.skill_grid[n].icon[skill.id].level;
                } catch (e) {
                    var slevel = 0;
                }
                tmp = (tmp<<5)|slevel;
                tmp_count++;
                if (tmp_count == 6){
                    result += this.hash(tmp, 5);
                    tmp = 0;
                    tmp_count = 0;
                }
            }
        }
        return result;
    },

    hash_job: function(job, level) {
        return this.hash(job.id<<7|level);
    },

    unhash_build: function(msg) {
        var msg = msg.split('.')[0];
        var result = {};
        var num = 0;
        var count = 0;
        for (var n in model.job_byindx){
            for (var i=0; i<24; i++) {
                if (count%6 == 0) {
                    num = this.unhash(msg.slice(0,5));
                    msg = msg.slice(5);
                }
                var level = num>>(25-(count%6)*5)&31;
                if (level>0) { result[model.job_byindx[n].skill[i].id] = level;}
                count++;
            }
        }
        return result;
    },

    unhash_job: function(msg) {
        var msg = this.unhash(msg.split('.')[1]);
        return { 'job':msg>>7 , 'level':msg&127 };
    },

});
