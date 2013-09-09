library models;
import 'dart:json';

class Models {
  Map<int, Job> job_byid = new Map<int, Job>();
  List<Job> job_byindx = new List<Job>();
  Map<int, Skill> skill_byid = new Map<int, Skill>();
  Map<int, SkillLevel> slevel_byid = new Map<int, SkillLevel>();

  Models(String response) {
    List<Map> parsed = parse(response);
    Map<int, String> description_temp = new Map<int, String>();
    List<List> parent_temp = new List<List>();

    // This assumes objects are sent in this order Job - Skill - SkillLevel
    for (Map obj in parsed) {
      switch (obj['model']) {
        case Job.model_name:
          job_byid[obj['pk']] = parse_job(obj);
          break;

        case Skill.model_name:
          description_temp[obj['pk']] = obj['fields']['description'];
          Skill skill = parse_skill(obj);
          skill_byid[obj['pk']] = skill;
          skill.job.skilltree[skill.tree_index] = skill;
          if (obj['fields']['parent_1'] != null) { parent_temp.add([skill, obj['fields']['parent_1']]); }
          if (obj['fields']['parent_2'] != null) { parent_temp.add([skill, obj['fields']['parent_2']]); }
          if (obj['fields']['parent_3'] != null) { parent_temp.add([skill, obj['fields']['parent_3']]); }
          break;

        case SkillLevel.model_name:
          SkillLevel slevel = parse_slevel(obj, description_temp);
          slevel_byid[obj['pk']] = slevel;
          slevel.skill.level[slevel.level] = slevel;
          break;
      }
    }

    // Get Job indicies
    job_byindx = job_byid.values.toList()..sort( (Job a, Job b) => a.id - b.id );
    for (int n=0; n < job_byindx.length; n++) { job_byindx[n].index = n; }

    // fix skill parents
    for (List l in parent_temp){ l[0].parent.add(slevel_byid[l[1]]); }
  }

  Job parse_job(Map obj) {
    return new Job()
      ..id = obj['pk']
      ..name = obj['fields']['name']
      ..parent = job_byid[obj['fields']['parent']];
  }

  Skill parse_skill(Map obj) {
    return new Skill()
      ..id = obj['pk']
      ..job = job_byid[obj['fields']['job']]
      ..name = obj['fields']['name']
      ..icon = obj['fields']['icon']
      ..tree_index = obj['fields']['tree_index']
      ..sp_required = [obj['fields']['sp_required_0'],obj['fields']['sp_required_1'], obj['fields']['sp_required_2']];
  }

  SkillLevel parse_slevel(Map obj, Map<int, String> description_temp) {
    String pve_description = description_temp[obj['fields']['skill']];
    String pvp_description = description_temp[obj['fields']['skill']];
    List<String> pve_params = obj['fields']['description_params_pve'].split(',');
    List<String> pvp_params = obj['fields']['description_params_pvp'].split(',');
    for (int n=0; n < pvp_params.length; n++) {
      pve_description = pve_description.replaceAll('{${n}}', pve_params[n]);
      pvp_description = pvp_description.replaceAll('{${n}}', pvp_params[n]);
    }

    return new SkillLevel()
      ..description_pve = pve_description
      ..description_pvp = pvp_description
      ..id = obj['pk']
      ..level = obj['fields']['level']
      ..skill = skill_byid[obj['fields']['skill']]
      ..sp_cost = obj['fields']['sp_cost']
      ..sp_cost_cumulative = obj['fields']['sp_cost_cumulative']
      ..required_level = obj['fields']['required_level'];
  }
}

class Job {
  static const String model_name = 'skills.job';
  int id;
  int index;
  String name;
  Job parent;
  Map<int, Skill> skilltree = new Map<int, Skill>();
}

class Skill {
  static const String model_name = 'skills.skill';
  int id;
  Job job;
  String name;
  int icon;
  List<SkillLevel> parent = new List<SkillLevel>();
  List<int> sp_required = new List<int>();
  int tree_index;
  Map<int, SkillLevel> level = new Map<int, SkillLevel>();
}

class SkillLevel {
  static const String model_name = 'skills.skilllevel';
  int id;
  int level;
  String description_pve;
  String description_pvp;
  int required_level;
  Skill skill;
  int sp_cost;
  int sp_cost_cumulative;
}
