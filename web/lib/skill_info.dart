library skill_info;
import 'dart:html';
import 'package:polymer/polymer.dart';
import 'models.dart';

Map<String,String> _color_codes = {
  '#w' : '</span><span class="info-default">',
  '#y' : '</span><span class="info-yellow">',
};

@CustomTag('skill-info')
class SkillInfo extends PolymerElement {
  DivElement body;
  bool get applyAuthorStyles => true;
  bool desc_pve = true;
  Skill skill;
  int level;
  
  void inserted() {
    body = shadowRoot.query('.panel-body');
    shadowRoot.query('button').onClick.listen(toggle_pve);
  }
  
  void set_info(Skill nskill, int nlevel) {
    skill = nskill;
    level = nlevel;
    SkillLevel sl_cur = skill.level[level];
    SkillLevel sl_nxt = skill.level[level+1];
    
    body.children.clear();
    body.children.add(new Element.html('<h2>${skill.name}</h2>'));
    body.children.add(new Element.html('<hr>'));
    body.children.add(new Element.html('<p><span class="info-orange">Skill Level: </span><span class="info-default">${level}</span></p>'));
    if (sl_nxt != null) {
      body.children.add(new Element.html('<p><span class="info-orange">SP Cost: </span><span class="info-default">${sl_nxt.sp_cost}</span></p>'));
      body.children.add(new Element.html('<p><span class="info-orange">Req Level: </span><span class="info-default">${sl_nxt.required_level}</span></p>'));
      for (SkillLevel slevel in skill.parent) {
        body.children.add(new Element.html('<p><span class="info-orange">Req Skill: </span><span class="info-default">${slevel.skill.name} Level ${slevel.level}</span></p>'));        
      }
    }
    
    body.children.add(new Element.html('<hr>'));
    if (sl_cur != null) {
      body.children.add(new Element.html('<p>Current Level:</p>'));
      body.children.add(get_description(skill, sl_cur));
    }
    if (sl_nxt != null) {
      body.children.add(new Element.html('<p>Next Level:</p>'));
      body.children.add(get_description(skill, sl_nxt));
    }
  }
  
  Element get_description(Skill skill, SkillLevel slevel) {
    String description;
    if (desc_pve) {
      description = '<p><span class="info-default">${slevel.description_pve.replaceAll('\\n', '<br>')}</span></p>';
    } else {
      description = '<p><span class="info-default">${slevel.description_pvp.replaceAll('\\n', '<br>')}</span></p>';
    }
    for (String key in _color_codes.keys) {
      description = description.replaceAll(key, _color_codes[key]);
    }
    return new Element.html(description);
  }
  
  void toggle_pve(MouseEvent e) {
    if (desc_pve) {
      desc_pve = false;
      shadowRoot.query('button').text = 'PvP';
    } else {
      desc_pve = true;
      shadowRoot.query('button').text = 'PvE';
    }
    set_info(skill, level);
  }
  
  void clear() {
    body.children.clear();
  }
}