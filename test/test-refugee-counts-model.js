
var assert = require('assert');
var should = require('should');
var fs = require('fs');
var moment = require('moment');

var RefugeeCountsModel = require('../src/js/model/refugee-counts-model.js');


// for some reason the "total values"
// http://popstats.unhcr.org/en/asylum_seekers_monthly
// displays invalid sums
//
// also the csv export has some more values than the
// web view
//

var lastDayStamp = function(year, month) {
	return moment([year, month]).endOf('month').unix();
};

var firstDayStamp = function(year, month) {
	return moment([year, month]).startOf('month').unix();
};

describe('RefugeeCountsModel', function() {

	var startStamp = firstDayStamp(2012, 0);
	var data = JSON.parse(fs.readFileSync('temp/data-assets/asylum.json'));
	var model = new RefugeeCountsModel(data);


	describe('asylumData', function() {
		it('correct total for germany during jan 2015', function() {
			assert.equal(
				data.filter(function(item) {
					return item.ac == "DEU" && item.year==2012 && item.month==1
				}).reduce(function(prev, val) {
					return prev + val.count;
				}, 0
			), 4667);
		});
	});

	describe('pairCountsByDestination', function() {
		it('correct total for AFG -> DEU @ jan 2015', function() {
			assert.equal(model.pairCountsByDestination['DEU']['AFG'][3][0].count, 1248);
		});
	});

	describe('getTotalDestinationCounts', function() {
		it('correct total for germany for jan 2012', function() {
		 	assert.equal(model.getTotalDestinationCounts(
		 		'DEU', [startStamp, moment([2012, 0, 31]).unix()]).asylumApplications, 4667);
		});
		it('correct total for germany by end of 2014', function() {
			assert.equal(model.getTotalDestinationCounts('DEU', [startStamp, moment([2014, 11, 31]).unix()])
				.asylumApplications, 346633);
		});
		it('correct total for finland by end of 2014', function() {
			assert.equal(model.getTotalDestinationCounts('FIN', [startStamp, moment([2014, 11, 31]).unix()])
				.asylumApplications, 8894);
		});
		it('correct total for finland for 2013', function() {
			assert.equal(model.getTotalDestinationCounts('FIN',
				[firstDayStamp(2013, 0), lastDayStamp(2013, 11)])
				.asylumApplications, 3022);
		});
	});

	describe('getGlobalArrivingFor', function() {
		it('correct total for Jan 2013 (only European destinations)', function() {
			assert.equal(model.getGlobalArrivingFor(moment([2013, 0])).asylumApplications, 31092);
		});
		it('correct total for August 2015 (only European destinations)', function() {
			assert.equal(model.getGlobalArrivingFor(moment([2015, 7])).asylumApplications, 183895);
		});
	});

	describe('getGlobalArrivingPerMonthForCountry', function() {
		var germanyTotals = model.getGlobalArrivingPerMonthForCountry('DEU');

		it('correct total for germany for jan 2012', function() {
		 	assert.equal(germanyTotals[0].asylumApplications, 4667);
		});

		it('correct total for germany for jun 2014', function() {
		 	assert.equal(germanyTotals[12*2 + 5].asylumApplications, 12445);
		});

		it('correct total for germany for oct 2015', function() {
		 	assert.equal(germanyTotals[12*3 + 9].asylumApplications, 58083);
		});
	});

	describe('getOriginCountsByDestinationCountries()', function() {
		it('correct total for SYR->GER after one months end', function() {
			assert.equal(model.getOriginCountsByDestinationCountries('SYR',
				[startStamp, lastDayStamp(2012, 0)])['DEU'].asylumApplications, 210);
		});
		it('correct total for SYR->GER after two months end', function() {
			assert.equal(model.getOriginCountsByDestinationCountries('SYR',
				[startStamp, lastDayStamp(2012, 1)])['DEU'].asylumApplications, 440);
		});
		it('correct total for SYR->GER during 2013', function() {
			assert.equal(model.getOriginCountsByDestinationCountries('SYR',
				[firstDayStamp(2013, 0), lastDayStamp(2013, 11)])['DEU'].asylumApplications, 11851);
		});
	});

	describe('getDestinationCountsByOriginCountries()', function() {
		it('correct total for SYR->GER after one months end', function() {
			assert.equal(model.getDestinationCountsByOriginCountries('DEU',
				[startStamp, lastDayStamp(2012, 0)])['SYR'].asylumApplications, 210);
		});
		it('correct total for SYR->GER after two months end', function() {
			assert.equal(model.getDestinationCountsByOriginCountries('DEU',
				[startStamp, lastDayStamp(2012, 1)])['SYR'].asylumApplications, 440);
		});
		it('correct total for SYR->GER during 2013', function() {
			assert.equal(model.getDestinationCountsByOriginCountries('DEU',
				[firstDayStamp(2013, 0), lastDayStamp(2013, 11)])['SYR'].asylumApplications, 11851);
		});
	});


});
