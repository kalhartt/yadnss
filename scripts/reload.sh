#!/bin/bash
DNFILES=~/dnfiles

cd django
source venv/bin/activate
dropdb heroku
createdb heroku
python manage.py syncdb --noinput
python manage.py import $DNFILES
python manage.py gen_navigation 60 ../polymer/templates/navbar.html
