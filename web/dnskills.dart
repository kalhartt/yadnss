import 'dart:html';
import 'lib/build_url.dart';

BuildURL build_url;

void main() {
  // Collect components
  build_url = query('#build-url').xtag;
}