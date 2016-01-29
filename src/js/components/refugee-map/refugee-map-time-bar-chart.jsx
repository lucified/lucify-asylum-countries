
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


  getMargins: function() {
    return {top: 30, right: 30, bottom: 50, left: 60};
  },


  updateCountriesWithMissingData: function(timeRange) {

    var textForCountryList = function(countryList) {

      if (this.props.country != null) {
        return "Maahan <b>" + this.props.mapModel.getFriendlyNameForCountry(this.props.country) + "</b> turvapaikkahakemuksen jättäneet";
      }

      var missingDataText = '';
      var countryCount = countryList.length;

      if (countryCount > 0) {
        if (countryCount > 5) {
          missingDataText = "Dataa puuttuu seuraavista maista: " +
            countryList.slice(0, 4).join(', ') + " ja " +
            (countryCount - 4) + " muuta maata";
        } else {
          missingDataText = "Dataa puuttuu seuraavista maista: ";
          if (countryCount > 1) {
            missingDataText += countryList.slice(0, countryCount - 1).join(', ') +
              " ja ";
          }
          missingDataText += countryList[countryCount - 1];
        }
      }

      return missingDataText;
    }.bind(this);


    var tooltipForCountryList = function(countryList) {

      if (this.props.country != null) {
        return "Maahan " + this.props.mapModel.getFriendlyNameForCountry(this.props.country) + " turvapaikkahakemuksen jättäneet";
      }

      if (countryList.length > 0) {
          return "Dataa puuttuu seuraavista maista: " + countryList.join(', ');
      } else {
          return '';
      }

    }.bind(this);

    var countriesWithMissingData = this.props.refugeeCountsModel
      .getDestinationCountriesWithMissingDataForTimeRange(timeRange)
      .map(item => {
          return this.props.mapModel.getFriendlyNameForCountry(item);
      });

    this.labelSelection
      .attr('title', tooltipForCountryList(countriesWithMissingData))
      .html(textForCountryList(countriesWithMissingData));
  },


  getDataMissingStartMoment: function() {
    var timestamp = moment(refugeeConstants.DATA_END_MOMENT);
    var countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);

    while (countriesWithMissingData.length > 0) {
      timestamp.subtract(1, 'months');
      countriesWithMissingData = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestamp);
    }

    return timestamp.endOf('month');
  },


  getSourceData: function() {
    if (!this.props.country) {
        return this.props.refugeeCountsModel.getGlobalArrivingPerMonth();
    }
    return this.props.refugeeCountsModel.getGlobalArrivingPerMonthForCountry(this.props.country);
  },


  componentDidMount: function() {
    this.labelSelection = d3.select(React.findDOMNode(this.refs.missingData));
    this.updateCountriesWithMissingData(this.props.timeRange);

    this.initializeChart(this.getSourceData());
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
    this.yScale = yScale;
    this.height = height;

    var xAxis = d3.svg.axis()
        .scale(this.xScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%Y"))
        .ticks(d3.time.months, 12)
        .tickSize(5, 5);

    this.yAxis = d3.svg.axis()
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

    this.svg
        .append('defs')
        .append('pattern')
          .attr('id', 'diagonalHatch')
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', 4)
          .attr('height', 4)
        .append('path')
          .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
          .attr('stroke', 'rgb(0, 111, 185)')
          .attr('stroke-width', 2);

    var beginningOfIncompleteData = this.getDataMissingStartMoment();

    this.svg.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "timebar")
        .attr("x", d => this.xScale(d.date))
        .attr("width", Math.ceil(width/data.length))
        //.attr("y", d => yScale(d.asylumApplications))
        //.attr("height", d => height - yScale(d.asylumApplications))
        .attr("fill", d =>
          beginningOfIncompleteData.isBefore(moment(d.date)) ?
            'url(#diagonalHatch)' : 'rgb(0, 111, 185)');

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    this.svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis);

    this.updateWithData(data);
    // TODO: make chart responsive to window resizes
  },


  updateWithData: function(data) {
      this.yScale.domain([0, d3.max(data, function(d) { return d.asylumApplications; })]);
      this.yAxis.scale(this.yScale);

      this.svg.select('.y')
        .call(this.yAxis);

      this.svg.selectAll("rect")
          .data(data)
          .attr("y", d => this.yScale(d.asylumApplications))
          .attr("height", d => this.height - this.yScale(d.asylumApplications))
          .attr("fill", d => {
              if (!this.props.country) {
                 var beginningOfIncompleteData = this.getDataMissingStartMoment();
                 if (beginningOfIncompleteData.isBefore(moment(d.date))) {
                    return 'url(#diagonalHatch)';
                 } else {
                    return 'rgb(0, 111, 185)';
                 }
              } else {
                return 'rgb(0, 111, 185)';
              }

          });
  },


  shouldComponentUpdate: function() {
    return true;
  },


  componentDidUpdate: function() {
      this.updateWithData(this.getSourceData());
      this.updateCountriesWithMissingData(this.props.timeRange);
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
