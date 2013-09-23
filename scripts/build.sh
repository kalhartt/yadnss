#!/bin/bash

OUTDIR=(out)

JSUTILS=(sprintf.js)
JSBOOTSTRAP=(jquery.js collapse.js dropdown.js tooltip.js)
JSPOLYMER=(build_url.js skill_grid.js skill_icon.js skill_info.js skill_points.js)
JSMAIN=(model.js main.js)

CSSMAIN=(bootstrap.css font-awesome.min.css)
CSSPOLYMER=(polymer-collapse.css polymer-ui-accordion.css polymer-ui-collapsible.css)

COMPONENTS=(build_url.html polymer-ajax.html polymer-collapse.html polymer-selector.html polymer-ui-accordion.html polymer-ui-collapsible.html polymer-xhr.html skill_grid.html skill_icon.html skill_info.html skill_points.html)

TEMPLATES=(navbar.html)
LAYOUTS=(layout_collapse.html)

##########
# Clean output directory
##########
if [ -d $OUTDIR ]; then
    rm -rf ${OUTDIR}/*
fi
mkdir -p $OUTDIR/{js,font,img,css,html,templates,tmp}

##########
# Compile Javascript
##########
sed -e 's!console!//console!' ${JSUTILS[@]/#/js\/} ${JSBOOTSTRAP[@]/#/js\/} ${JSPOLYMER[@]/#/polymer-elements\/} ${JSMAIN[@]/#/js\/} >> $OUTDIR/tmp/main.js
uglifyjs -o $OUTDIR/js/main.js $OUTDIR/tmp/main.js
cp js/polymer.min.js $OUTDIR/js/

##########
# Compile CSS
##########
cat ${CSSMAIN[@]/#/css\/} ${CSSPOLYMER[@]/#/polymer-elements\/} >> $OUTDIR/css/main.css

##########
# Compile HTML Polymer Components
##########
cat ${COMPONENTS[@]/#/polymer-elements\/} >> $OUTDIR/html/components.html

##########
# Copy Assets
##########
cp -r {img,font} $OUTDIR/

##########
# Copy Templates
##########
for html in ${TEMPLATES[@]}; do
    cp templates/${html} $OUTDIR/templates/
done

# TODO
# Sed/Awk script to convert imports to use minified
for html in ${LAYOUTS[@]}; do
    cp templates/${html}.out $OUTDIR/templates/${html}
done

##########
# Cleanup
##########
rm -rf ${OUTDIR}/tmp
