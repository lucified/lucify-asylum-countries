
var React = require('react');
var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');
var _ = require('underscore');

var theme = require('lucify-commons/src/js/lucify-theme.jsx');


var RefugeeMapLineChart = React.createClass({


  getHeight: function() {
    return 100;
  },

  getData: function() {
    var mom = moment(refugeeConstants.DATA_START_MOMENT);
    var endMoment = moment(refugeeConstants.DATA_END_MOMENT);
    var cols = [];
    var xvals = [];

    do {
      var totalCount = this.props.refugeeCountsModel.getGlobalArrivingPerMonth(mom);
      cols.push(totalCount.asylumApplications);
      xvals.push(mom.unix());
      mom.add(5, 'days');
    } while (mom.isBefore(endMoment));


    var ret = {
      x: 'x',
      columns: [
        ['x'].concat(xvals),
        ['data1'].concat(cols)
      ],
      colors: {
        data1: '#ffffff'
      },
      regions: {
        'data1': [{
            start: this.getDataMissingStartStamp(),
            end: refugeeConstants.DATA_END_MOMENT.unix(),
            style: 'dashed'
        }]
      }
    };
    return ret;
  },


  shouldComponentUpdate: function() {
    return false;
  },


  handleTimeRangeChange: function(stampRange) {
    d3.select(".brush")
        .call(this.brush.extent(stampRange));

    this.updateCountriesWithMissingData(stampRange);

    if (this.props.onTimeRangeChange) {
      this.props.onTimeRangeChange(stampRange);
    }
  },


  updateCountriesWithMissingData: function(timeRange) {
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
        var countryCodes = this.props.refugeeCountsModel
          .getDestinationCountriesWithMissingData(currentMoment);
        monthCountries = this.countriesWithMissingDataCache[currentIndex] =
          _.map(countryCodes, function(countryCode) {
            return this.props.mapModel.getFriendlyNameForCountry(countryCode);
          }.bind(this));
      }

      countriesWithMissingData = countriesWithMissingData.concat(monthCountries);
      currentMoment.add(1, 'months');
    }

    countriesWithMissingData = _.uniq(countriesWithMissingData);
    countriesWithMissingData.sort();

    var countryCount = countriesWithMissingData.length;
    if (countryCount > 0) {
      var missingDataText;
      if (countryCount > 5) {
        missingDataText = "Missing data from " + countriesWithMissingData.slice(0, 4).join(', ') +
          " and " + (countryCount - 4) + " other countries";
      } else {
        missingDataText = "Missing data from ";
        if (countryCount > 1) {
          missingDataText += countriesWithMissingData.slice(0, countryCount - 1).join(', ') +
            " and ";
        }
        missingDataText += countriesWithMissingData[countryCount - 1];
      }

      this.labelSelection
        .attr('title', "Missing data for " + countriesWithMissingData.join(', '))
        .text(missingDataText);
    } else {
      this.labelSelection
        .attr('title', '')
        .text('');
    }
  },


  getSpec: function() {
    return {
      axis: {
        x: {
          show: false
        },
        y: {
          show: false
        },
      },
      point: {
        show: false
      },
      legend: {
        show: false
      },
      padding: {
        top: 0,
        bottom: 0,
        right: 0,
        left: 0
      },
      tooltip: {
        show: false
      }
    };
  },


  getDataMissingStartStamp: function() {
    var timestamp = moment(refugeeConstants.DATA_END_MOMENT);
    var countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);

    while (countriesWithMissingData.length > 0) {
      timestamp.subtract(1, 'months');
      countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);
    }

    return timestamp.endOf('month').unix();
  },


  componentDidMount: function() {
    this.labelSelection = d3.select(React.findDOMNode(this.refs.missingData));
    this.countriesWithMissingDataCache = {};
    this.updateCountriesWithMissingData(this.props.timeRange);
    this.initializeSelectionHandlers();
  },


  initializeSelectionHandlers: function() {
    var svg = d3.select(".refugee-map-line-chart__selected-area");
    var chart = this.refs.c3Chart.chart;
    this.brush = d3.svg.brush()
      .x(chart.internal.x)
      .extent(this.props.timeRange)
      .on("brush", this.brushed);

    var gBrush = svg.append("g")
      .attr("class", "brush")
      .call(this.brush);

    gBrush.selectAll("rect")
      .attr("height", this.getHeight());
  },


  // from http://bl.ocks.org/mbostock/6232620
  brushed: function() {
    var dateExtent = this.brush.extent().map(function(stamp) { return new Date(stamp * 1000); }),
      roundedDateExtent;

    // if dragging, preserve the width of the extent
    if (d3.event.mode === "move") {
      // we need the additional 1 because when we only have one month selected,
      // it's the first and last day of the same month – the result would then be 0
      var monthsDiff = dateExtent[1].getMonth() - dateExtent[0].getMonth() +
        (12 * (dateExtent[1].getYear() - dateExtent[0].getYear()));
      var d0 = d3.time.month.round(dateExtent[0]),
          d1 = d3.time.month.offset(d0, monthsDiff);
      roundedDateExtent = [d0, d1];
    }

    // otherwise, if resizing, round both dates
    else {
      roundedDateExtent = dateExtent.map(d3.time.month.round);

      // if empty when rounded, use floor & ceil instead
      if (roundedDateExtent[0] >= roundedDateExtent[1]) {
        roundedDateExtent[0] = d3.time.month.floor(dateExtent[0]);
        roundedDateExtent[1] = d3.time.month.ceil(dateExtent[1]);
      }
    }

    // d3 rounds to the first day of the following month. DATA_END_MOMENT
    // is the last day of the previous month. moment.js's endOf('month')
    // seems to do this, i.e. remove one second
    roundedDateExtent[1] = d3.time.second.offset(roundedDateExtent[1], -1);

    var roundedStampExtent = roundedDateExtent.map(function(date) { return date.getTime() / 1000; });
    this.handleTimeRangeChange(roundedStampExtent);
  },


  render: function() {
    return (
      <div className='refugee-map-line-chart'>
        <span ref="missingData" className="refugee-map-line-chart__missing-data" />
        <svg className='refugee-map-line-chart__selected-area' />
        <C3Chart
          ref='c3Chart'
          lineStrokeWidth={2}
          height={this.getHeight()}
          spec={this.getSpec()}
          data={this.getData()} />
      </div>
    );
  }

});

module.exports = RefugeeMapLineChart;
