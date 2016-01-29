
var React = require('react');

var refugeeConstants = require('../../model/refugee-constants.js');
var moment = require('moment');
var _ = require('underscore');
var d3 = require('d3');

var theme = require('lucify-commons/src/js/lucify-theme.jsx');


var RefugeeMapTimeBarChart = React.createClass({


  getHeight: function() {
    return 160;
  },


  shouldComponentUpdate: function() {
    return false;
  },


  getMargins: function() {
    return {top: 30, right: 30, bottom: 50, left: 60};
  },


  updateCountriesWithMissingData: function(timeRange) {
    var cacheIndexFor = function(mom) {
      return mom.year() * 12 + mom.month();
    };

    var textForCountryList = function(countryList) {
      var missingDataText = '';
      var countryCount = countryList.length;

      if (countryCount > 0) {
        if (countryCount > 5) {
          missingDataText = "Missing data from " + countryList.slice(0, 4).join(', ') +
            " and " + (countryCount - 4) + " other countries";
        } else {
          missingDataText = "Missing data from ";
          if (countryCount > 1) {
            missingDataText += countryList.slice(0, countryCount - 1).join(', ') +
              " and ";
          }
          missingDataText += countryList[countryCount - 1];
        }
      }

      return missingDataText;
    };

    var tooltipForCountryList = function(countryList) {
      if (countryList.length > 0) {
        return "Missing data for " + countryList.join(', ');
      } else {
        return '';
      }
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

    this.labelSelection
      .attr('title', tooltipForCountryList(countriesWithMissingData))
      .text(textForCountryList(countriesWithMissingData));
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

    this.initializeChart(this.props.refugeeCountsModel.getGlobalArrivingPerMonth());
    this.initializeSelectionHandlers();
  },


  initializeChart: function(data) {
    var margin = this.getMargins(),
        width = parseInt(d3.select(React.findDOMNode(this.refs.chart)).style('width'), 10),
        height = this.getHeight() - margin.top - margin.bottom;

    width = width - margin.left - margin.right;

    // convert moments to Dates
    data = data.map(function(d) {
      return {
        date: d.date.toDate(),
        asylumApplications: d.asylumApplications };
      });

    this.xScale = d3.time.scale().range([0, width]);
    var yScale = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%Y"))
        .ticks(d3.time.months, 12)
        .tickSize(5, 5);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format('s'))
        .ticks(3)
        .tickSize(4, 0);

    this.svg = d3.select(React.findDOMNode(this.refs.chart))
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Kludge ahead: because data contains Dates that are at the beginning of
    // each month, we need to extend the domain to the end of the last month
    // in the array. Otherwise we can't pick that month with the brush.
    // Do this by adding a month and then subtracting a second.
    this.xScale.domain([
      data[0].date,
      d3.time.second.offset(d3.time.month.offset(data[data.length-1].date, 1), -1)
    ]);
    yScale.domain([0, d3.max(data, function(d) { return d.asylumApplications; })]);



    this.svg.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "timebar")
        .attr("x", d => this.xScale(d.date))
        .attr("width", Math.ceil(width/data.length))
        .attr("y", d => yScale(d.asylumApplications))
        .attr("height", d => height - yScale(d.asylumApplications));

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      //.selectAll("text")
        //.style("text-anchor", "end")
        //.attr("dx", "0.6em")
        //.attr("dy", "1.0em")
        //.attr("transform", "rotate(-45)" );



    this.svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    // TODO: mark months with incomplete data
  },


  initializeSelectionHandlers: function() {
    this.brush = d3.svg.brush()
      .x(this.xScale)
      .extent(this.props.timeRange.map(function(d) { return new Date(d * 1000); }))
      .on("brush", this.brushed);

    var gBrush = this.svg.append("g")
      .attr("class", "brush")
      .call(this.brush);

    gBrush.selectAll("rect")
      .attr("height", this.getHeight() - this.getMargins().top - this.getMargins().bottom);
  },


  handleTimeRangeChange: function(stampRange) {
    d3.select(".brush")
        .call(this.brush.extent(stampRange.map(function(d) { return new Date(d * 1000); })));

    this.updateCountriesWithMissingData(stampRange);

    if (this.props.onTimeRangeChange) {
      this.props.onTimeRangeChange(stampRange);
    }
  },


  // based on http://bl.ocks.org/mbostock/6232620
  brushed: function() {
    var dateExtent = this.brush.extent(),
      roundedDateExtent;

    // if dragging, preserve the width of the extent
    if (d3.event.mode === "move") {
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
      <div className='refugee-map-time'>
        <span ref="missingData" className="refugee-map-time__missing-data" />
        <svg ref='chart' className='refugee-map-time__chart' />
      </div>
    );
  }

});

module.exports = RefugeeMapTimeBarChart;
