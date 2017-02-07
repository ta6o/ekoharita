#!/bin/bash          
cd ../public/javascripts/
cat jquery.js leaflet.js leaflet.providers.js scrollpane.js lunr.min.js > all.js
java -jar ../../lib/yui.jar --type js all.js > main.js

cd ../stylesheets/
#/home/yakup/git/gpmed/node_modules/.bin/purifycss ./all.css ../index.html --out ./mini.css --info
cat leaflet.css app.css > all.css
java -jar ../../lib/yui.jar --type css ./all.css > ./main.css

echo "css updated on `date`"

