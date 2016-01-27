
var _ = require('underscore');
var moment = require('moment');
var utils = require('../utils.js');
var console = require("console-browserify");

var refugeeConstants = require('./refugee-constants.js');


/*
 * Provides an efficient stateless API for accessing
 * counts of asylum seekers and refugees
 *
 * The main backing data structure is:
 *
 *   this.arrivedRefugeeCount[country][year][month]
 *
 * With each item having the following fields:
 *
 *   count                      count of asylum seekers during the month
 *
 */

var RefugeeCountsModel = function(asylumData) {
  this.destinationCountries = {};
  this.arrivedRefugeesToCountry = {};
  this.pairCountsByDestination = {};
  this.pairCountsByOrigin = {};
  this.destinationCountriesWithMissingData = {};
  this.globalRefugees = [];

  this._initializeDataStructures(asylumData);
  this._addData(asylumData);
  this._calculateMissingData();
};


//
// Internal functions for object construction
// ------------------------------------------
//

RefugeeCountsModel.prototype._initializeDataStructures = function(data) {
  this.globalRefugees = this._prepareYearsMonthsArray(function() { return { count: 0 }; });

  data.forEach(function(item) {
    if (!this.arrivedRefugeesToCountry[item.ac]) {
      this.arrivedRefugeesToCountry[item.ac] = this._prepareYearsMonthsArray(function() { return { count: 0 }; });
    }

    this._ensurePairInitialized(this.pairCountsByDestination, item.ac, item.oc);
    this._ensurePairInitialized(this.pairCountsByOrigin, item.oc, item.ac);
  }.bind(this));

  this.destinationCountriesWithMissingData = this._prepareYearsMonthsArray(function() { return []; });
};


RefugeeCountsModel.prototype._prepareYearsMonthsArray = function(initialDataGenerator) {
  var ret = new Array(refugeeConstants.DATA_END_YEAR - refugeeConstants.DATA_START_YEAR + 1);
  for (var y = 0; y < ret.length; y++) {
    ret[y] = new Array(12);
    for (var m = 0; m < ret[y].length; m++) {
      ret[y][m] = initialDataGenerator();
    }
  }
  return ret;
};


RefugeeCountsModel.prototype._ensurePairInitialized = function(pc, dim1, dim2) {
  if (!pc[dim1]) {
    pc[dim1] = {};
  }
  if (!pc[dim1][dim2]) {
    pc[dim1][dim2] = this._prepareYearsMonthsArray(function() { return { count: 0 }; });
  }
};


RefugeeCountsModel.prototype._addData = function(data) {
  data.forEach(function(item) {
    this._addMonthlyArrivals(item.ac, item.oc, item.year, item.month, item.count);
    this.destinationCountries[item.ac] = true;
  }.bind(this));
};


RefugeeCountsModel.prototype._addMonthlyArrivals = function(destinationCountry, originCountry, year, month, count) {
  if (year < refugeeConstants.DATA_START_YEAR) return;

  var yearIndex = year - refugeeConstants.DATA_START_YEAR;
  var monthIndex = month - 1;

  console.assert(monthIndex >= 0 && monthIndex < 12, "Month is between 0 and 11");
  console.assert(yearIndex >= 0 && yearIndex < (refugeeConstants.DATA_END_YEAR - refugeeConstants.DATA_START_YEAR + 1),
    "Year is between 0 and " + (refugeeConstants.DATA_END_YEAR - refugeeConstants.DATA_START_YEAR + 1));

  this.globalRefugees[yearIndex][monthIndex].count += count;
  this.arrivedRefugeesToCountry[destinationCountry][yearIndex][monthIndex].count += count;
  this.pairCountsByDestination[destinationCountry][originCountry][yearIndex][monthIndex].count += count;
  this.pairCountsByOrigin[originCountry][destinationCountry][yearIndex][monthIndex].count += count;
};


/*
 * Assume that "big" European countries should receive at least some asylum seekers from
 * the most distressed origin countries: Syria, Iraq. If there are no asylum seekers
 * from these countries, assume the data is (at least partially) missing for that month.
 */
RefugeeCountsModel.prototype._calculateMissingData = function() {
  var destinationCountriesToCheck = [
    "AUT", "BEL", "BGR", "CHE", "DEU", "DNK", "ESP", "FIN",
    "FRA", "GBR", "GRC", "HUN", "ITA", "NOR", "NLD", "SWE"
  ];
  var originCountriesToCheck = ["SYR", "IRQ", "UKR"];
  var year = 3; // only check 2015

  for (var month = 0; month < 12; month++) {
    _.forEach(destinationCountriesToCheck, function(destinationCountry) {
      var countryData = this.pairCountsByDestination[destinationCountry];
      var originCountriesWithDataCount = 0;
      _.forEach(originCountriesToCheck, function(originCountry) {
        if (countryData[originCountry] && countryData[originCountry][year][month].count > 0) {
          originCountriesWithDataCount++;
        }
      });
      if (originCountriesWithDataCount === 0) {
        this.destinationCountriesWithMissingData[year][month].push(destinationCountry);
      }
    }.bind(this));
  }
};


//
// Private functions
// -----------------
//

RefugeeCountsModel.prototype._prepareTotalCount = function(item, endStamp, debugInfo) {
  var mom = moment(new Date(endStamp * 1000));

  if (mom.isAfter(refugeeConstants.DATA_END_MOMENT)) {
    mom = refugeeConstants.DATA_END_MOMENT; // show last available data once we reach it
  }

  var dayOfMonth = mom.date();
  var yearIndex = mom.year() - refugeeConstants.DATA_START_YEAR;
  var monthIndex = mom.month();
  var country = item;

  if (!country) {
    return { asylumApplications: 0 };
  } else if (!country[yearIndex]) {
    console.log("nothing found for year " + yearIndex + ", debugInfo: " + debugInfo + ", stamp " + endStamp);
    return { asylumApplications: 0 };
  } else {
    return {
      asylumApplications: Math.round(country[yearIndex][monthIndex].totalArrivedAtStartOfMonth +
        dayOfMonth * country[yearIndex][monthIndex].arrivingPerDay)
    };
  }
};



//
// Public API
// ----------
//


RefugeeCountsModel.prototype.getGlobalArrivingPerMonth = function(mom) {

  if (mom.isAfter(refugeeConstants.DATA_END_MOMENT)) {
    mom = refugeeConstants.DATA_END_MOMENT; // show last available data once we reach it
  }

  var yearIndex = mom.year() - refugeeConstants.DATA_START_YEAR;
  var monthIndex = mom.month();

  return {
      asylumApplications: this.globalRefugees[yearIndex][monthIndex].count
  };
};



RefugeeCountsModel.prototype.getGlobalTotalCounts = function(endStamp) {
  return this._prepareTotalCount(this.globalRefugees, endStamp, 'totalcount');
};

/*
 * Get total counts for people that have arrived in
 * given destination country at given timestamp
 *
 *  Returned in an object with fields
 *    asylumApplications - total count of asylum applications
 */
RefugeeCountsModel.prototype.getTotalDestinationCounts = function(countryName, endStamp) {
  return this._prepareTotalCount(this.arrivedRefugeesToCountry[countryName], endStamp, countryName);
};


/*
 * Get countries that have originated refugees for the given
 * destination country before the given timestamp
 */
RefugeeCountsModel.prototype.getOriginCountriesByStamp = function(destinationCountry, endStamp) {
  var counts = this.getDestinationCountsByOriginCountries(destinationCountry, endStamp);
  return _.keys(counts).filter(function(country) {
    return counts[country].asylumApplications > 0;
  });
};


/*
 * Get destination countries for refugees originating from the given
 * origin country before the given timestamp
 */
RefugeeCountsModel.prototype.getDestinationCountriesByStamp = function(originCountry, endStamp) {
  var counts = this.getOriginCountsByDestinationCountries(originCountry, endStamp);
  return _.keys(counts).filter(function(country) {
    return counts[country].asylumApplications > 0;
  });
};



/*
 * Get counts of asylum seekers and refugees who
 * have arrived at destinationCountry before endStamp
 *
 * Returned as a hash with the country code of each
 * origin country as key
 */
RefugeeCountsModel.prototype.getDestinationCountsByOriginCountries = function(destinationCountry, endStamp) {
  var ret = {};
  _.keys(this.pairCountsByDestination[destinationCountry]).forEach(function(originCountry){
    ret[originCountry] = this._prepareTotalCount(
      this.pairCountsByDestination[destinationCountry][originCountry], endStamp);
  }.bind(this));
  return ret;
};


/*
 * Get counts of asylum seekers and refugees who have
 * arrived before given endStamp, and originate
 * from the given originCountry
 */
RefugeeCountsModel.prototype.getOriginCountsByDestinationCountries = function(originCountry, endStamp) {
  var ret = {};
  _.keys(this.pairCountsByOrigin[originCountry]).forEach(function(destinationCountry){
    ret[destinationCountry] = this._prepareTotalCount(
      this.pairCountsByOrigin[originCountry][destinationCountry], endStamp);
  }.bind(this));
  return ret;
};



RefugeeCountsModel.prototype.getDestinationCountries = function() {
  return _.keys(this.destinationCountries);
};


RefugeeCountsModel.prototype.getDestinationCountriesWithMissingData = function(timestamp) {
  var yearIndex = timestamp.year() - refugeeConstants.DATA_START_YEAR;
  var monthIndex = timestamp.month();
  return this.destinationCountriesWithMissingData[yearIndex][monthIndex];
};



module.exports = RefugeeCountsModel;
