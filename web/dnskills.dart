import 'dart:html';
import 'lib/build_url.dart';
import 'lib/models.dart';
import 'lib/skill_grid.dart';
import 'lib/skill_info.dart';
import 'lib/skill_points.dart';
import 'lib/skill_warning.dart';

BuildURL build_url;
List<SkillGrid> skill_grid;
DivElement grid_container;
SkillInfo skill_info;
SkillPoints skill_points;
SkillWarning skill_warning;

Models model;
String json_url = "all/60/27";
String base_url = "http://localhost:8000/";

void main() {
  // Collect components
  build_url = query('#build-url').xtag;
  grid_container = query('#accordion');
  skill_info = query('#skill-info').xtag;
  skill_points = query('skill-points').xtag
    ..sp_limits = [104, 107, 104, 167];
  skill_warning = query('#skill-warning').xtag;HttpRequest.getString('${base_url}${json_url}').then(load_models);
  
}

void load_models(String response) {
  model = new Models(response);
  skill_points.set_labels(model.job_byindx);
  skill_info.set_info(model.job_byindx[0].skilltree[0], 0);
}