#!/bin/bash

if [ "$1" == "dev" ]; then
    rm django/skills/{templates,static/*}
    ln -s polymer/templates django/skills/templates
    ln -s polymer/{css,font,js,img,polymer-elements} djagno/skills/static/
elif [ "$1" == "out" ]; then
    rm django/skills/{templates,static/*}
    ln -s polymer/out/templates django/skills/templates
    ln -s polymer/out/{css,font,js,img,html} django/skills/static/
else
    echo "Unknown Option"
fi
