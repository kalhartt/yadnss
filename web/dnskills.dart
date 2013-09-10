import 'dart:html';
import 'lib/build_url.dart';
import 'lib/models.dart';
import 'lib/skill_grid.dart';
import 'lib/skill_info.dart';
import 'lib/skill_points.dart';
import 'lib/skill_warning.dart';

BuildURL build_url;
SkillGrid skill_grid;
SkillInfo skill_info;
SkillPoints skill_points;
SkillWarning skill_warning;

Models model;
String json_url = "all/60/27";
String base_url = "http://localhost:8000/";
String static_base = 'static/';

void main() {
  // Collect components
  build_url = query('#build-url').xtag;
  skill_grid = query('#skill-grid').xtag;
  skill_info = query('#skill-info').xtag;
  skill_points = query('skill-points').xtag;
  skill_warning = query('#skill-warning').xtag;HttpRequest.getString('${base_url}${json_url}').then(load_models);
}

void load_models(String response) {
  // Load the models
  model = new Models(response);
  
  // Reset widgets
  skill_points
    ..clear()
    ..sp_limits = [104, 107, 104, 167]
    ..set_labels(model.job_byindx);
  skill_info.clear();
  skill_warning.clear();
  skill_grid.clear();
  model.job_byindx.forEach((job) => skill_grid.add_icons(job, static_base));
  
  // Connect mouse events
  skill_grid.connect_mover(mouse_over);
  skill_grid.connect_mclick(mouse_click);
  skill_grid.connect_mcontext(mouse_context);
}

void mouse_over(MouseEvent e) {
  int skill_id = int.parse(e.target.id.split('-')[1]);
  Skill skill = model.skill_byid[skill_id];
  SkillIcon skillicon = skill_grid.skillicon[skill_id];
  skill_info.set_info(skill, skillicon.level);
}

void mouse_click(MouseEvent e) {
  int skill_id = int.parse(e.target.id.split('-')[1]);
  Skill skill = model.skill_byid[skill_id];
  SkillIcon skillicon = skill_grid.skillicon[skill_id];
  
  if (skill.level.containsKey(skillicon.level+1)) {
    if (skillicon.level == 0) { skillicon.set_hi(); }
    skillicon.level += 1;
    skillicon.text.text = '${skillicon.level}/${skill.level.length}';
    skill_info.set_info(skill, skillicon.level);
    update();
  }
}

void mouse_context(MouseEvent e) {
  e.preventDefault();
  int skill_id = int.parse(e.target.id.split('-')[1]);
  Skill skill = model.skill_byid[skill_id];
  SkillIcon skillicon = skill_grid.skillicon[skill_id];
  
  if (skillicon.level>0) {
    if (skillicon.level == 1) { skillicon.set_lo(); }
    skillicon.level -= 1;
    skillicon.text.text = '${skillicon.level}/${skill.level.length}';
    skill_info.set_info(skill, skillicon.level);
    update();
  }
}

void update() {
  List<SkillLevel> slevels = skill_grid.get_slevels();
  skill_points.calc_sp(slevels);
  skill_warning.clear();
  
  // SP checks
  List<String> req_jobsp = new List<String>();
  List<String> req_skill = new List<String>();
  if (skill_points.sp_used.last > skill_points.sp_limits.last) { skill_warning.add_warning('Total SP limit exceeded'); }
  for (Job job in model.job_byindx) {
    if (skill_points.sp_used[job.index] > skill_points.sp_limits[job.index]) {
      skill_warning.add_warning('${job.name} SP Limit Exceeded');
    }
  }
  for (SkillLevel slevel in slevels) {
    for (Job job in model.job_byindx) {
      if (skill_points.sp_used[job.index] < slevel.skill.sp_required[job.index]){ 
        req_jobsp.add('${job.name} SP ${slevel.skill.sp_required[job.index]} required for skill ${slevel.skill.name}');
      }
    }
    for (SkillLevel parent in slevel.skill.parent) { 
      if (!slevels.any((SkillLevel sl) => sl.skill == parent.skill && sl.level >= parent.level)) {
        req_skill.add('${parent.skill.name} level ${parent.level} required for ${slevel.skill.name}');
      }
    }
    req_jobsp.forEach(skill_warning.add_warning);
    req_skill.forEach(skill_warning.add_warning);
    
    build_url.value = '${base_url}${build_url.hash_build(model.job_byindx.last, 60, slevels)}';
  }
}