library build_url;
import 'package:polymer/polymer.dart';
import 'models.dart';

@CustomTag('build-url')
class BuildURL extends PolymerElement with ObservableMixin {
  static const List<int> _asciipoints = const [
    48,49,50,51,52,53,54,55,56,57, // 0-9
    65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90, // A-Z
    97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122, // a-z
    45,95 // -_
    ];
  static final Map<int, String> _ALPHABET = new Map.fromIterable(
      new Iterable.generate(64, (i) => i),
      key: (int n) => n,
      value: (int n) => new String.fromCharCode(_asciipoints[n])
      );
  static final Map<String, int> _ALPHABET_REVERSE = new Map.fromIterable(
      new Iterable.generate(64, (i) => i),
      key: (int n) => new String.fromCharCode(_asciipoints[n]),
      value: (int n) => n
      );
  @observable String value = '';
  bool get applyAuthorStyles => true;

  String _hash(int num) {
    StringBuffer result = new StringBuffer();
    while (num != 0) {
      result.write(_ALPHABET[num&63]);
      num = num>>6;
    }
    return result.toString();
  }

  int _unhash(String msg) {
    int result = 0;
    for (String c in msg.split('')) {
      result = (result<<6) | _ALPHABET_REVERSE[c];
    }
    return result;
  }

  String hash_build(Job job, int level, List<SkillLevel> slevels) {
    StringBuffer result = new StringBuffer();
    for (SkillLevel slevel in slevels) {
      String tmp = _hash( (slevel.skill.job.index<<10)|(slevel.level<<5)|slevel.skill.tree_index );
      result.write( tmp.length==2 ? tmp : '0${tmp}');
    }
    result.write('.${_hash((job.id<<7)|level)}');
    return result.toString();
  }

  List<SkillLevel> unhash_slevels(List<Job> job_byindx, String msg){
    List<SkillLevel> result = new List<SkillLevel>();
    String skillmsg = msg.split('.')[0];
    for (int n=0; n < skillmsg.length; n+=2) {
      int skillinfo = _unhash(skillmsg.substring(n, n+2));
      int job_indx = skillinfo>>10;
      int level = (skillinfo>>5)&31;
      int tree_index = skillinfo&31;
      try {
        SkillLevel slevel = job_byindx[job_indx].skilltree[tree_index].level[level];
        result.add(slevel);
      } catch (e) {
        continue;
      }
    }
  }
}
