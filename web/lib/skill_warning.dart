library skill_warning;
import 'package:polymer/polymer.dart';
import 'dart:html';

@CustomTag('skill-warning')
class SkillWarning extends PolymerElement {
  bool get applyAuthorStyles => true;
  
  void add_warining(String msg){
    shadowRoot.query('.panel-body').children.add(
      new DivElement()
        ..classes.addAll(['alert', 'alert-danger'])
        ..text = msg);
  }
  
  void clear() {
    shadowRoot.query('.panel-body').children.clear();
  }
}