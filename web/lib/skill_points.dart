library skill_points;
import 'dart:html';
import 'package:polymer/polymer.dart';
import 'models.dart';

@CustomTag('skill-points')
class SkillPoints extends PolymerElement {
  bool get applyAuthorStyles => true;
  List<int> sp_limits; // [job0, {job1, job2, ...}, totalsp]
  List<int> sp_used;
  DivElement panel_body;
  
  void inserted() {
    panel_body = shadowRoot.query('.panel-body');
  }
  
  void set_labels(List<Job> job_byindx) {
    sp_used = new List.filled(job_byindx.length+1, 0);
    for (Job job in job_byindx) {
      panel_body.children.add(
        new Element.html('<p>${job.name}<span class="badge pull-right sp-badge-${job.id}">0/0</span></p>')
        );
    }
    calc_sp([]);
  }
  
  void calc_sp(Iterable<SkillLevel> slevels) {
    sp_used = new List.filled(sp_used.length, 0);
    for (SkillLevel slevel in slevels) {
      sp_used[slevel.skill.job.index] += slevel.sp_cost_cumulative;
      sp_used[sp_used.length-1] += slevel.sp_cost_cumulative;
    }
    
    List<Element> spelem = panel_body.queryAll('.badge');
    for (int n=0; n < sp_used.length-1; n++) {
      spelem[n].text = '${sp_used[n]}/${sp_limits[n]}';
      if (sp_used[n] > sp_limits[n]){
        spelem[n]..classes.add('alert-danger');
      } else {
        spelem[n]..classes.remove('alert-danger');
      }
    }
    shadowRoot.query('.sp-total').text = '${sp_used.last}/${sp_limits.last}';
  }
  
  void clear() {
    panel_body.children.clear();
    shadowRoot.query('.sp-total').text = '0/0';
  }
}