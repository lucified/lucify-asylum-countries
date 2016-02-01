
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
  this.countriesWithMissingDataCache = {};

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
 * Assume that "big" European countries should receive at least some asylum
 * seekers from the most distressed origin countries: Syria, Iraq, Ukraine.
 * If there are no asylum seekers from these countries, assume the data is
 * (at least partially) missing for that month.
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

RefugeeCountsModel.prototype._prepareTotalCount = function(country, startStamp, endStamp, debugInfo) {
  if (!country) {
    console.log("No country defined");
    return { asylumApplications: 0 };
  }

  var endMoment = moment(new Date(endStamp * 1000));
  var startMoment = moment(new Date(startStamp * 1000));

  if (endMoment.isAfter(refugeeConstants.DATA_END_MOMENT)) {
    console.log(endMoment + " is past the data end point by " +
      endMoment.diff(refugeeConstants.DATA_END_MOMENT, 'days') + ' days');
    endMoment = refugeeConstants.DATA_END_MOMENT; // show last available data once we reach it
  }

  if (startMoment.isBefore(refugeeConstants.DATA_START_MOMENT)) {
    console.log(startMoment + " is before the data start point");
    startMoment = moment(refugeeConstants.DATA_START_MOMENT);
  }

  var currentYearIndex = startMoment.year() - refugeeConstants.DATA_START_YEAR;
  var currentMonth = startMoment.month();
  var endYearIndex = endMoment.year() - refugeeConstants.DATA_START_YEAR;
  var endMonth = endMoment.month();
  var asylumTotal = 0;

  while (currentYearIndex < endYearIndex ||
         (currentYearIndex == endYearIndex && currentMonth <= endMonth)) {
    if (!country[currentYearIndex]) {
      console.log("nothing found for year " + currentYearIndex + ", debugInfo: " + debugInfo);
      currentYearIndex++;
    } else {
      asylumTotal += country[currentYearIndex][currentMonth].count;
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYearIndex++;
      }
    }
  }

  return {
    asylumApplications: asylumTotal
  };
};


/*
 * Return an array of all the countries from which asylum seekers are arriving
 * at the supplied country, or all the countries where asylum seekers are
 * fleeing to from this country (depending on pariCountryData).
 */
RefugeeCountsModel.prototype._getPairCountriesList = function(country, pairCountryData, startStamp, endStamp) {
  var counts = this._getPairCountryCounts(country, pairCountryData, startStamp, endStamp);
  return _.keys(counts).filter(function(otherCountry) {
    return counts[otherCountry].asylumApplications > 0;
  });
};


/*
 * Return a hash of all the "pair" countries (i.e. destination or origin
 * countries, depending on the passed pairCountryData) of the supplied country.
 * The value of the hash is the object with e.g. asylum seeker counts during
 * the supplied time range.
 */
RefugeeCountsModel.prototype._getPairCountryCounts = function(country, pairCountryData, startStamp, endStamp) {
  // If we only get one timestamp, assume it is the endStamp
  if (endStamp === undefined) {
    endStamp = startStamp;
    startStamp = refugeeConstants.DATA_START_MOMENT.unix();
  }
  var ret = {};
  _.keys(pairCountryData[country]).forEach(function(otherCountry){
    ret[otherCountry] = this._prepareTotalCount(
      pairCountryData[country][otherCountry], startStamp, endStamp);
  }.bind(this));
  return ret;
};



//
// Public API
// ----------
//

RefugeeCountsModel.prototype.isDestination = function(country) {
  return this.arrivedRefugeesToCountry[country] != null;
};


/*
 * Get total global asylum seekers for the given month.
 */
RefugeeCountsModel.prototype.getGlobalArrivingFor = function(mom) {
  if (mom.isAfter(refugeeConstants.DATA_END_MOMENT)) {
    mom = moment(refugeeConstants.DATA_END_MOMENT); // show last available data once we reach it
  }

  var yearIndex = mom.year() - refugeeConstants.DATA_START_YEAR;
  var monthIndex = mom.month();

  return {
    asylumApplications: this.globalRefugees[yearIndex][monthIndex].count
  };
};


/*
 * Get an array of the monthly totals of all asylum seekers,
 * from DATA_BEGIN_MOMENT to DATA_END_MOMENT. Each object in the
 * array has the fields 'date', a moment which is set to the beginning of the
 * month, and an integer 'asylumApplications'.
 */
RefugeeCountsModel.prototype.getGlobalArrivingPerMonth = function() {
  var curMoment = moment(refugeeConstants.DATA_START_MOMENT);
  var globalAsylumSeekersPerMonth = [];

  while (curMoment.isBefore(refugeeConstants.DATA_END_MOMENT)) {
    var monthData = this.getGlobalArrivingFor(curMoment);
    monthData.date = moment(curMoment);
    globalAsylumSeekersPerMonth.push(monthData);
    curMoment.add(1, 'months');
  }

  return globalAsylumSeekersPerMonth;
};


/*
 * Get an array of the monthly totals of all asylum seekers,
 * from DATA_BEGIN_MOMENT to DATA_END_MOMENT, for given country
 *
 * Each object in the
 * array has the fields 'date', a moment which is set to the beginning of the
 * month, and an integer 'asylumApplications'.
 */
RefugeeCountsModel.prototype.getGlobalArrivingPerMonthForCountry = function(country) {
  var curMoment = moment(refugeeConstants.DATA_START_MOMENT);
  var ret = [];

  while (curMoment.isBefore(refugeeConstants.DATA_END_MOMENT)) {
    var yearIndex = curMoment.year() - refugeeConstants.DATA_START_YEAR;
    var monthIndex = curMoment.month();

    if (this.arrivedRefugeesToCountry[country] != null &&
        this.arrivedRefugeesToCountry[country][yearIndex] != null &&
        this.arrivedRefugeesToCountry[country][yearIndex][monthIndex] != null) {
      var count = this.arrivedRefugeesToCountry[country][yearIndex][monthIndex].count;
      ret.push({asylumApplications: count, date: moment(curMoment)});
    } else {
      ret.push({asylumApplications: 0, date: moment(curMoment)});
    }
    curMoment.add(1, 'months');
  }
  return ret;
};


RefugeeCountsModel.prototype.getGlobalArrivingPerMonthForAllCountries = function() {
  var ret = [];

  _.keys(this.arrivedRefugeesToCountry).sort().forEach(country => {
    ret.push({
      country: country,
      values: this.getGlobalArrivingPerMonthForCountry(country)
    });
  });

  return ret;
};


/*
 * Get total counts of arrived people by (destination) country
 */
RefugeeCountsModel.prototype.getTotalDestinationCountsByCountries = function(timeRange) {
    var ret = {};

    _.keys(this.arrivedRefugeesToCountry).forEach(country => {
        ret[country] = this._prepareTotalCount(
          this.arrivedRefugeesToCountry[country],
          timeRange[0], timeRange[1], country);
    });
    return ret;
};

RefugeeCountsModel.prototype.computePerCountry = function (timeRange, f) {
    var ret = {};

    _.keys(this.arrivedRefugeesToCountry).forEach(country => {
         var total = this._prepareTotalCount(
          this.arrivedRefugeesToCountry[country],
          timeRange[0], timeRange[1], country);
        ret[country] = f(country, total)
    });
    return ret;
};


/*
 * Get total counts for people that have arrived in
 * given destination country at given timestamp
 *
 *  Returned in an object with fields
 *    asylumApplications - total count of asylum applications
 */
RefugeeCountsModel.prototype.getTotalDestinationCounts = function(countryName, timeRange) {
  return this._prepareTotalCount(this.arrivedRefugeesToCountry[countryName], timeRange[0], timeRange[1], countryName);
};


/*
 * Get countries that have originated refugees for the given
 * destination country between the given timestamps
 */
RefugeeCountsModel.prototype.getOriginCountriesByTimeRange = function(destinationCountry, timeRange) {
  return this._getPairCountriesList(destinationCountry, this.pairCountsByDestination, timeRange[0], timeRange[1]);
};


/*
 * Get destination countries for refugees originating from the given
 * origin country between the given timestamps
 */
RefugeeCountsModel.prototype.getDestinationCountriesByTimeRange = function(originCountry, timeRange) {
  return this._getPairCountriesList(originCountry, this.pairCountsByOrigin, timeRange[0], timeRange[1]);
};




/*
 * Get counts of asylum seekers and refugees who
 * have arrived at destinationCountry between given timestamps
 *
 * Returned as a hash with the country code of each
 * origin country as key
 */
RefugeeCountsModel.prototype.getDestinationCountsByOriginCountries = function(destinationCountry, timeRange) {
  return this._getPairCountryCounts(destinationCountry, this.pairCountsByDestination, timeRange[0], timeRange[1]);
};


/*
 * Get counts of asylum seekers and refugees who have
 * arrived between the given timestamps, and originate
 * from the given originCountry
 */
RefugeeCountsModel.prototype.getOriginCountsByDestinationCountries = function(originCountry, timeRange) {
  return this._getPairCountryCounts(originCountry, this.pairCountsByOrigin, timeRange[0], timeRange[1]);
};



RefugeeCountsModel.prototype.getDestinationCountries = function() {
  return _.keys(this.destinationCountries);
};


RefugeeCountsModel.prototype.getDestinationCountriesWithMissingData = function(mom) {
  if (mom.isAfter(refugeeConstants.DATA_END_MOMENT)) {
    console.log("Trying to get missing countries past data end moment");
    mom = moment(refugeeConstants.DATA_END_MOMENT);
  }
  var yearIndex = mom.year() - refugeeConstants.DATA_START_YEAR;
  var monthIndex = mom.month();
  return this.destinationCountriesWithMissingData[yearIndex][monthIndex];
};


RefugeeCountsModel.prototype.getDestinationCountriesWithMissingDataForTimeRange = function(timeRange) {

  var cacheIndexFor = function(mom) {
      return mom.year() * 12 + mom.month();
  };

  var currentIndex;
  var currentMoment = moment.unix(timeRange[0]);
  var endIndex = cacheIndexFor(moment.unix(timeRange[1]));

  var countriesWithMissingData = [];

  while ((currentIndex = cacheIndexFor(currentMoment)) <= endIndex) {
    var monthCountries = this.countriesWithMissingDataCache[currentIndex];

    // fill cache if missing
    if (monthCountries === undefined) {
      monthCountries = this.countriesWithMissingDataCache[currentIndex] =
        this.getDestinationCountriesWithMissingData(currentMoment);
    }

    countriesWithMissingData = countriesWithMissingData.concat(monthCountries);
    currentMoment.add(1, 'months');
  }

  countriesWithMissingData = _.uniq(countriesWithMissingData);
  countriesWithMissingData.sort();

  return countriesWithMissingData;
}



RefugeeCountsModel.prototype.getEuroFigures = function(countryFigures, limit) {
    var ret = this.getUnsortedEuroFigures(countryFigures).sort(function(a, b) {
      var ac = this
        .getTotalDestinationCounts(a.country, refugeeConstants.fullRange)
        .asylumApplications;
      var bc = this
        .getTotalDestinationCounts(b.country, refugeeConstants.fullRange)
        .asylumApplications;
      return bc - ac;
    }.bind(this));
    return ret.slice(0, limit);
},


RefugeeCountsModel.prototype.getUnsortedEuroFigures = function(countryFigures) {
    var filtered = _.filter(countryFigures, item => {
      if (!countryFigures[item.country]) {
        return false;
      }
      if (!this.isDestination(item.country)) {
        return false;
      }
      var counts = this.getTotalDestinationCounts(item.country, refugeeConstants.fullRange);
      var totalCount = counts.asylumApplications;

      //if (totalCount < 5000) {
      //  // TODO: add this to some "others" category
      //  return false;
      //}
      return true;
    });
    return filtered;
}


module.exports = RefugeeCountsModel;
