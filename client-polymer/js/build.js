var build = (function() {
	var self = {};

	self.alphabet = {};
    self.alphabet_reverse = {};

    var n = 0;
    for (var i=45; i<123; i++) {
        if (i == 46){ i = 48; }
        if (i == 58){ i = 65; }
        if (i == 91){ i = 95; }
        if (i == 96){ i = 97; }
        self.alphabet[n] = String.fromCharCode(i);
        self.alphabet_reverse[String.fromCharCode(i)] = n;
        n++;
    }

    self.hash = function(num, len) {//{{{
        console.debug("build.hash - enter");
        var result = '';
        while (num !== 0) {
            result += self.alphabet[num&63];
            num = num>>6;
        }
        if (result.length < len) { 
            result = result + new Array(1+len-result.length).join(self.alphabet[0]);
        }
        console.debug("build.hash - exit");
        return result;
    };//}}}

    self.unhash = function(msg) {//{{{
        console.debug("build.unhash - enter");
        var result = 0;
        for (var n=msg.length-1; n>=0; n--) {
            result = (result<<6) | self.alphabet_reverse[msg[n]];
        }
        console.debug("build.unhash - exit");
        return result;
    };//}}}

    self.hash_build = function() {//{{{
        console.debug("build.hash_build - enter");
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
                    result += self.hash(tmp, 5);
                    tmp = 0;
                    tmp_count = 0;
                }
            }
        }
        console.debug("build.hash_build - exit");
        return result;
    };//}}}

    self.hash_job = function(job, level) {//{{{
        console.debug("build.hash_job - enter");
        var hash = self.hash(job.id<<7|level);
        console.debug("build.hash_job - exit");
        return hash;
    };//}}}

    self.unhash_build = function(message) {//{{{
        console.debug("build.unhash_build - enter");
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
                    num = self.unhash(msg.slice(0,5));
                    msg = msg.slice(5);
                }
                level = num>>(25-(count%6)*5)&31;
                if (level>0) { result[model.job_byindx[n].skill[i].id] = level;}
                count++;
            }
        }
        console.debug("build.unhash_build - exit");
        return result;
    };//}}}

    self.unhash_job = function(message) {//{{{
        console.debug("build.unhash_job - enter");
        var msg = self.unhash(message.split('.')[1]);
        var result = { 'job':msg>>7 , 'level':msg&127 };
        console.debug("build.unhash_job - exit");
        return result;
    };//}}}

    return self;

})();
