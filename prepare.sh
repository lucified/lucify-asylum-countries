#!/bin/bash

# Clean up
rm -rf temp data/*.json
# Create directory structure
node_modules/.bin/gulp prepare-skeleton

ogr2ogr \
  -f GeoJSON \
  -where "Continent NOT IN ('Antarctica')" \
  temp/detailed-map.json \
  data/ne_10m_admin_0_countries.shp

# 0.15
cat temp/detailed-map.json | node_modules/.bin/simplify-geojson -t 0.08 > temp/map.json

node_modules/.bin/topojson \
  -o temp/data-assets/topomap.json \
  -p ADM0_A3,CONTINENT,POP_EST,GDP_MD_EST,REGION_UN \
  -- \
  temp/map.json


### Process UNHCR data
src/scripts/prepare-asylum-data.rb

node src/scripts/prepare-country-figures.js

# we are not using the labels for anything

#ogr2ogr \
#  -f GeoJSON \
#  -where "scalerank IN (0)" \
#  data/labels.json \
#  data/ne_10m_admin_0_label_points.shp


# this was just for development

#ogr2ogr \
#  -f GeoJSON \
#  data/fullmap.json \
#  data/ne_10m_admin_0_countries.shp
