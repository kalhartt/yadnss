library skill_grid;
import 'dart:html';
import 'package:polymer/polymer.dart';
import 'models.dart';

class SkillIcon {
  int level;
  Skill skill;
  String static_base;
  ImageElement img;
  SpanElement text;
  
  SkillIcon(this.skill, this.static_base, String ptext) {
    level = 0;
    int index = skill.tree_index;
    int posx = (3-index%4)*60 + 10;
    int posy = (index~/4)*60 + 10;
    img = new ImageElement()
      ..id = 'skillicon-${skill.id}'
      ..src = '${static_base}img/lo/${skill.icon}.png'
      ..classes.add('skill-grid-icon')
      ..style.right = '${posx}px'
      ..style.top = '${posy}px';
    text = new SpanElement()
      ..id = 'skilltext-${skill.job.id}-${index}'
      ..text = ptext
      ..classes.addAll(['badge', 'skill-grid-text'])
      ..style.right = '${posx-5}px'
      ..style.top = '${posy+35}px';
  }
  
  void set_lo() {
    this.img.src = '${static_base}img/lo/${skill.icon}.png';
  }
  
  void set_hi() {
    this.img.src = '${static_base}img/hi/${skill.icon}.png';
  }
}

@CustomTag('skill-grid')
class SkillGrid extends PolymerElement {
  bool get applyAuthorStyles => true;
  Map<int,SkillIcon> skillicon;
  
  void inserted() {
    skillicon = new Map<int,SkillIcon>();
  }
  
  void add_icons(Job job, String static_base) {
    DivElement wrapper = new DivElement()
      ..classes.add('wrapper');
    DivElement container = new DivElement()
      ..classes.add('panel-body')
      ..children.add(wrapper);
    DivElement body = new DivElement()
      ..id = '${job.id}'
      ..classes.addAll(['panel-collapse', 'collapse', 'in'])
      ..children.add(container);
    DivElement header = new DivElement()
      ..classes.add('panel-heading')
      ..children.add(
          new Element.html('<h4 class="panel-title accordion-toggle">${job.name}</h4>')
            ..attributes['data-toggle'] = 'collapse'
            ..attributes['data-parent'] = '#accordion'
            ..attributes['href'] = '${body.id}');
    DivElement panel = new DivElement()
      ..classes.addAll(['panel', 'panel-default', 'skill-grid-panel'])
      ..children.addAll([header, body]);

    ImageElement background = new ImageElement()
          ..classes.add('skill-grid-bg')
          ..src = "${static_base}img/bg/${job.id}.png";
    wrapper.children.add(background);
    for (Skill skill in job.skilltree.values) {
      skillicon[skill.id] = new SkillIcon(skill, static_base, '0/${skill.level.length}');
      wrapper.children.add(skillicon[skill.id].img);
      wrapper.children.add(skillicon[skill.id].text);
    }
    shadowRoot.query('#accordion').children.add(panel);
  }
  
  void clear() {
    skillicon = new Map<int,SkillIcon>();
    shadowRoot.query('#accordion').children.clear();
  }
  
  void connect_mover(void handle(MouseEvent e)) {
    shadowRoot.queryAll('.skill-grid-icon').forEach(
        (Element e) => e.onMouseOver.listen(handle));
  }
  
  void connect_mclick(void handle(MouseEvent e)) {
    shadowRoot.queryAll('.skill-grid-icon').forEach(
        (Element e) => e.onClick.listen(handle));
  }
  
  void connect_mcontext(void handle(MouseEvent e)) {
    shadowRoot.queryAll('.skill-grid-icon').forEach(
        (Element e) => e.onContextMenu.listen(handle));
  }
  
  List<SkillLevel> get_slevels() {
    List<SkillLevel> result = new List<SkillLevel>();
    for (SkillIcon si in skillicon.values) {
      if (si.level == 0) { continue; }
      result.add(si.skill.level[si.level]);
    }
    return result;
  }
}