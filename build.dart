import 'dart:io';
import 'package:polymer/component_build.dart';     
import 'package:polymer/deploy.dart' as deploy;
        
main() {
  build(new Options().arguments, ['web/dnskills.html']).then((_) => deploy.main());
}