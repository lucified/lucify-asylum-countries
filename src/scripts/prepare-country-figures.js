
var fs = require('fs');
var topojson = require('topojson');
var _ = require('underscore');

var topomap = JSON.parse(fs.readFileSync('temp/data-assets/topomap.json', 'utf8'));
var features = topojson.feature(topomap, topomap.objects.map).features;


var data = {};

features.forEach(item => {
    var props = item.properties;
    var countryCode = props.ADM0_A3;
    var population = props.POP_EST;
    var gdp = props.GDP_MD_EST;

    if (population < 0) {
      population = null;
    }

    if (gdp < 0) {
      gdp = null;
    }

    if (!data[countryCode]) {
        data[countryCode] = {
            population: population,
            gdp: gdp,
            continent: props.REGION_UN
        }
    } else {
      console.log("found duplicate for " + countryCode);
    }
});


fs.writeFileSync('temp/data-assets/country-figures.json',
  JSON.stringify(data, null, 3));


