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

void main() {
  // Collect components
  build_url = query('#build-url').xtag;
  grid_container = query('#accordion');
  skill_info = query('#skill-info').xtag;
  skill_points = query('skill-points').xtag;
  skill_warning = query('#skill-warning').xtag;
}