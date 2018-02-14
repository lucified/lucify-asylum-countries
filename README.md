# Visualising the amount of asylum seekers to European countries

A visualization of the amount of asylum seekers to European countries from 2012 onwards. It is based on [UNHCR data](#data-source). See the visualisation [online](http://www.lucify.com/seeking-asylum-in-europe).

![Visualisation screenshot](https://raw.githubusercontent.com/lucified/lucify-asylum-countries/master/screenshot.png)

This project was built for and funded by the In-house Information Design pilot for the [Yhtäköyttä](http://yhtakoytta.fi/) project. The project is a part of the Prime Minister's Office of Finland's analysis, assessment and research activities.

This project uses a combination of [React](https://facebook.github.io/react/), [D3.js](http://d3js.org/) and [C3.js](http://c3js.org/).

## Development

### Dependencies

- Node 8 + Yarn
- Development: Ruby + [RubyGems](https://rubygems.org/pages/download)
- Development: Bundler: `gem install bundler`
- Development: GDAL (<http://www.gdal.org/>). On OS X with homebrew install with `brew install gdal`.

### Setup and running

Run the following in the project directory:

1. `bundle install`
2. `yarn`
3. `yarn start`

To regenerate the data, run `./prepare.sh`.

### Distribution build

The project has been configured to build a distribution that
assumes that it will be hosted in a public path of `embed/lucify-asylum-countries/`.

You can change this by modifying the `assetContext` attribute
in [lucify-opts.js](lucify-opts.js).

Build a distribution to the folder `dist` with:
```js
yarn build
```

### Unit tests

Run unit test with the command `mocha` in thr project directory.

### Embed codes

The build automatically creates a file called `embed-codes-custom.html` alongside `index.html`. It contains embed codes for embedding the visualisation into other pages through an iFrame.

## Data source

[UNHCR monthly asylum applications](http://popstats.unhcr.org/en/asylum_seekers_monthly)

If you update the data, you can change the time range of the visualization by updating the values in `src/js/model/refugee-constants.js`.

### Automatic download

Run the included download script:

```shell
./src/scripts/download-unhcr-data.sh
```

Run `./prepare.sh` to generate the JSON file for the visualization.

### Manual download

If you prefer to download the data manually, open the UNHCR asylum applications data portal, select the options below and click on Export / Current View / CSV:

+ Years: 2012, 2013, 2014, 2015, 2016, 2017
+ Months: All months
+ Country of asylum: All countries
+ Origin: All countries
+ Data item to display: Country of asylum, origin, year

Save the resulting file as `data/unhcr_popstats_export_asylum_seekers_monthly.csv`, remove the first four (header) rows and run `./prepare.sh` to generate the JSON file for the visualization.

## Authors

Have feedback? Contact us!

- [Juho Ojala](https://github.com/juhoojala)
- [Ville Saarinen](https://github.com/vsaarinen)
- [Ville Väänänen](https://github.com/dennari)

## Copyright and license

Copyright 2016-2018 Lucify Ltd. Code released under [the MIT license](LICENSE).
