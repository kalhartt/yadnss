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
  
}