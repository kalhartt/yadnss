/**
 * Namespace containing utilities for hashing
 * and unhashing a skill build
 * @namespace
 */
var build = (function() {
	var self = {};

    /**
     * Dictionary of valid hashing characters indexed
     * by ordinal value
     * @member {object.<number, string>}
     */
	self.alphabet = {};

    /**
     * Dictionary of valid hashing characters indexed
     * by ordinal value
     * @member {object.<string, number>}
     */
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

    /**
     * Method for converting a number to a base 64 string representation
     * @method
     * @param {number} num - the value to be hashed
     * @param {number} len - resulting string will be padded to this length
     */
    self.hash = function(num, len) {//{{{
        var result = '';
        while (num !== 0) {
            result += self.alphabet[num&63];
            num = num>>6;
        }
        if (result.length < len) { 
            result = result + new Array(1+len-result.length).join(self.alphabet[0]);
        }
        return result;
    };//}}}

    /**
     * Method for reverting a base 64 string to a number
     * @method
     * @param {number} msg - the hashed value
     */
    self.unhash = function(msg) {//{{{
        var result = 0;
        for (var n=msg.length-1; n>=0; n--) {
            result = (result<<6) | self.alphabet_reverse[msg[n]];
        }
        return result;
    };//}}}

    /**
     * Takes a list of jobs and hashes the skill levels
     * @method
     * @param {array[model.Job]} jobs
     */
    self.hash_build = function(jobs) {//{{{
        var n, i, level;
        var result = '';
        var tmp = 0;
        var tmp_count = 0;
        for (n in jobs){
            for (i=0; i<24; i++){
                level = (jobs[n].skill[i]) ? jobs[n].skill[i].level : 0;
                tmp = (tmp<<5)|level;
                tmp_count++;
                if (tmp_count == 6){
                    result += self.hash(tmp, 5);
                    tmp = 0;
                    tmp_count = 0;
                }
            }
        }
        return result;
    };//}}}

    /**
     * Hashes a job and character level
     * @method
     * @param {model.Job} job
     * @param {number} level
     */
    self.hash_job = function(job, level) {//{{{
        return self.hash(job.id<<7|level);
    };//}}}

    /**
     * Reads and sets skill levels from a buld hash
     * @method
     * @param {string} message - the build hash
     * @param {array[model.Job]} jobs
     */
    self.unhash_build = function(message, jobs) {//{{{
        console.log(1);
        var n, i, level, skill, slevel;
        var msg = message;
        var result = {};
        var num = 0;
        var count = 0;

        for (n in jobs){
            for (i=0; i<24; i++) {
                if (count%6 === 0) {
                    num = self.unhash(msg.slice(0,5));
                    msg = msg.slice(5);
                }
                level = num>>(25-(count%6)*5)&31;
                console.debug(n, i, level);
                if (level>0 && jobs[n].skill.hasOwnProperty(i)) {
                    jobs[n].skill[i].level = level;
                    jobs[n].skill[i].validate_level();
                }
                count++;
            }
        }
        console.log(2);
    };//}}}

    /**
     * Reads job id and character level from a job hash
     * @method
     * @param {string} message - the job hash
     */
    self.unhash_job = function(message) {//{{{
        var num = this.unhash(message);
        return { 'job':num>>7 , 'level':num&127 };
    };//}}}

    return self;

})();
