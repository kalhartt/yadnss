library skill_warning;
import 'package:polymer/polymer.dart';
import 'dart:html';

@CustomTag('skill-warning')
class SkillWarning extends PolymerElement {
  bool get applyAuthorStyles => true;
  
  void add_warning(String msg){
    shadowRoot.query('ul').children.add(
      new Element.html('<li>${msg}</li>'));
  }
  
  void clear() {
    shadowRoot.query('ul').children.clear();
  }
}