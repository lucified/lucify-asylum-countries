# Visualising the amount of asylum seekers to European countries

A visualization of the amount of asylum seekers to European countries from 2012 onwards. It is based on [UNHCR data](#data-source). See the visualisation [online](http://www.lucify.com/seeking-asylum-in-europe).

![Visualisation screenshot](https://raw.githubusercontent.com/lucified/lucify-asylum-countries/master/screenshot.png)

This project was built for and funded by the In-house Information Design pilot for the [Yhtäköyttä](http://yhtakoytta.fi/) project. The project is a part of the Prime Minister's Office of Finland's analysis, assessment and research activities.

This project uses a combination of [React](https://facebook.github.io/react/), [D3.js](http://d3js.org/) and [C3.js](http://c3js.org/).

## Development

### Dependencies

- Node 4 + NPM
- Development: Ruby + [RubyGems](https://rubygems.org/pages/download)
- Development: Bundler: `gem install bundler`
- Development: GDAL (<http://www.gdal.org/>). On OS X with homebrew install with `brew install gdal`.

### Setup and running

Run the following in the project directory:

1. `npm install`
2. `gulp` or `./node_modules/.bin/gulp`

This project requires gulp 4.0, which is installed by `npm install` under `node_modules`. To be able to use the plain `gulp` command as above, make sure you have gulp-cli version 0.4 installed:
```shell
npm install gulpjs/gulp-cli#4.0 -g
```

For development, run `bundle install` as well.

To regenerate the data, run `./prepare.sh`.

### Distribution build and publishing

The project has been configured to build and deploy a distribution for the Lucify hosting environment. This can be changed by overriding some default settings in `lucify-opts.js`. Below is an example of how you might wish to modify `lucify-opts.js` to work with your environment:

```js
module.exports = {
  paths: ['node_modules/lucify-commons'],
  assetContext: 'stuff/asylum-countries/'
  baseUrl: 'http://www.example.com/'
  bucket: 'my-s3-bucket',
  maxAge: 7200
};
```

With the above configuration, running the command `gulp dist` in the project root will prepare a distribution targeted to be published to `http://www.example.com/stuff/asylum-countries` in the `dist` folder.

Running the command `npm run-script deploy` will build and deploy the distribution to the path `stuff/asylum-countries` in a S3 bucket called `my-bucket`. With the given configuration, it will set a `max-age` header of 7200 for all assets with content hashes.

The deploy command will use credentials from the AWS credentials file (<http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html>). Thus you should make sure that proper credentials for deploying to the bucket are in place.

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

+ Years: 2012, 2013, 2014, 2015, 2016
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

Copyright 2016 Lucify Ltd. Code released under [the MIT license](LICENSE).
