Polymer('build-url', {
    value: '',

    created: function() {//{{{
        console.debug("build-url.created - enter");
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
        console.debug("build-url.created - exit");
    },//}}}

    hash: function(num, len) {//{{{
        console.debug("build-url.hash - enter");
        var result = '';
        while (num !== 0) {
            result += this.alphabet[num&63];
            num = num>>6;
        }
        if (result.length < len) { 
            result = result + new Array(1+len-result.length).join(this.alphabet[0]);
        }
        console.debug("build-url.hash - exit");
        return result;
    },//}}}

    unhash: function(msg) {//{{{
        console.debug("build-url.unhash - enter");
        var result = 0;
        for (var n=msg.length-1; n>=0; n--) {
            result = (result<<6) | this.alphabet_reverse[msg[n]];
        }
        console.debug("build-url.unhash - exit");
        return result;
    },//}}}

    hash_build: function() {//{{{
        console.debug("build-url.hash_build - enter");
        var n, i, slevel, skill;
        var result = '';
        var tmp = 0;
        var tmp_count = 0;
        for (n in model.job_byindx){
            for (i=0; i<24; i++){
                try {
                    skill = model.job_byindx[n].skill[i];
                    slevel = main.skill_grid[n].icon[skill.id].level;
                } catch (e) {
                    slevel = 0;
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
        console.debug("build-url.hash_build - exit");
        return result;
    },//}}}

    hash_job: function(job, level) {//{{{
        console.debug("build-url.hash_job - enter");
        var hash = this.hash(job.id<<7|level);
        console.debug("build-url.hash_job - exit");
        return hash;
    },//}}}

    unhash_build: function(message) {//{{{
        console.debug("build-url.unhash_build - enter");
        var n, i, level, skill, slevel;
        var msg = message.split('.')[0];
        var result = {};
        var num = 0;
        var count = 0;

        for (n in model.job_byindx[0].skill) {
            skill = model.job_byindx[0].skill[n];
            slevel = skill.level[1];
            if (slevel.req_level == 1 && slevel.sp_cost === 0) {
                result[skill.id] = 1;
            }
        }
        for (n in model.job_byindx){
            for (i=0; i<24; i++) {
                if (count%6 === 0) {
                    num = this.unhash(msg.slice(0,5));
                    msg = msg.slice(5);
                }
                level = num>>(25-(count%6)*5)&31;
                if (level>0) { result[model.job_byindx[n].skill[i].id] = level;}
                count++;
            }
        }
        console.debug("build-url.unhash_build - exit");
        return result;
    },//}}}

    unhash_job: function(message) {//{{{
        console.debug("build-url.unhash_job - enter");
        var msg = this.unhash(message.split('.')[1]);
        var result = { 'job':msg>>7 , 'level':msg&127 };
        console.debug("build-url.unhash_job - exit");
        return result;
    }//}}}

});
