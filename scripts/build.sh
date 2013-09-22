#!/bin/bash

OUTDIR=(out)

YUIPATH="scripts/yuicompressor-2.4.8.jar"

JSUTILS=(sprintf.js)
JSBOOTSTRAP=(jquery.js collapse.js dropdown.js tooltip.js)
JSPOLYMER=(build_url.js skill_grid.js skill_icon.js skill_info.js skill_points.js)
JSMAIN=(model.js main.js)

COMPONENTS=(build_url.html polymer-ajax.html polymer-collapse.html polymer-selector.html polymer-ui-accordion.html polymer-ui-collapsible.html polymer-xhr.html skill_grid.html skill_icon.html skill_info.html skill_points.html)

##########
# Clean output directory
##########
if [ -d $OUTDIR ]; then
    rm -rf out/*
fi
mkdir -p $OUTDIR/{js,font,img,css,html,tmp}

##########
# Compile Javascript
##########
uglifyjs -o $OUTDIR/tmp/main.js ${JSUTILS[@]/#/js} ${JSBOOTSTRAP[@]/#/js} ${JSPOLYMER[@]/#/polymer-elements} ${JSMAIN[@]/#/js}

##########
# Compile HTML Polymer Components
##########
for html in ${COMPONENTS[@]}; do
    cat polymer-elements/$html >> $OUTDIR/html/components.html
done
