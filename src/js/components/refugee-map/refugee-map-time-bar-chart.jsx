
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


  isEuroCountrySelected: function() {
      if (!this.props.country) {
        return false;
      }
      return this.props.countryFigures[this.props.country].continent == 'Europe'
        && this.props.country != 'RUS';
  },


  updateCountriesWithMissingData: function(timeRange) {

    var textForCountryList = function(countryList) {

      var missingDataText = '';
      var countryCount = countryList.length;

      if (countryCount > 0) {
        if (countryCount > 5) {
          missingDataText = "Dataa puuttuu: " +
            countryList.slice(0, 4).join(', ') + " ja " +
            (countryCount - 4) + " muuta maata";
        } else {
          missingDataText = "Dataa puuttuu: ";
          if (countryCount > 1) {
            missingDataText += countryList.slice(0, countryCount - 1).join(', ') +
              " ja ";
          }
          missingDataText += countryList[countryCount - 1];
        }
      }

      return "Eurooppaan saapuneet turvapaikanhakijat <span class='missing-data-real'>" + missingDataText + "</span>";
    }.bind(this);

    var tooltipForCountryList = function(countryList) {

      if (countryList.length > 0) {
        return "Dataa puuttuu seuraavista maista: " + countryList.join(', ');
      } else {
        return '';
      }

    }.bind(this);

    if (this.isEuroCountrySelected()) {
      this.labelSelection
        .attr('title', "Maahan " + this.props.mapModel.getFriendlyNameForCountry(this.props.country) + " turvapaikkahakemuksen jättäneet")
        .html("Maahan <b>" + this.props.mapModel.getFriendlyNameForCountry(this.props.country) + "</b> turvapaikkahakemuksen jättäneet");
    } else {
      var countriesWithMissingData = this.props.refugeeCountsModel
        .getDestinationCountriesWithMissingDataForTimeRange(timeRange)
        .map(item => {
            return this.props.mapModel.getFriendlyNameForCountry(item);
        });

      this.labelSelection
        .attr('title', tooltipForCountryList(countriesWithMissingData))
        .html(textForCountryList(countriesWithMissingData));
    }
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
    if (!this.isEuroCountrySelected()) {
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
    var margin = this.getMargins();
    this.height = this.getHeight() - margin.top - margin.bottom;
    this.width = this.props.width - margin.left - margin.right;

    // convert moments to Dates
    data = data.map(function(d) {
      return {
        date: d.date.toDate(),
        asylumApplications: d.asylumApplications };
      });

    this.xScale = d3.time.scale();
    this.yScale = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .orient("bottom")
        .tickFormat(d3.time.format("%Y"))
        .ticks(d3.time.months, 12)
        .tickSize(5, 5);

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient("left")
        .tickFormat(d3.format('s'))
        .ticks(3)
        .tickSize(4, 0);

    this.svg = d3.select(React.findDOMNode(this.refs.chart))
        .attr("width", this.width + margin.left + margin.right)
        .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

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

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

    this.svg.append("g")
        .attr("class", "y axis")
        .call(this.yAxis);

    this.updateWithData(data);
    // TODO: make chart responsive to window resizes
  },


  updateWithData: function(data) {
    var margin = this.getMargins();
    this.width = this.props.width - margin.left - margin.right;
    this.svg.attr("width", this.width + margin.left + margin.right);

    // Kludge ahead: because data contains Dates that are at the beginning of
    // each month, we need to extend the domain to the end of the last month
    // in the array. Otherwise we can't pick that month with the brush.
    // Do this by adding a month and then subtracting a second.
    this.xScale.range([0, this.width])
        .domain([
          data[0].date,
          d3.time.second.offset(d3.time.month.offset(data[data.length-1].date, 1), -1)
        ]);
    this.xAxis.scale(this.xScale);
    this.svg.select('.x')
      .call(this.xAxis);

    this.yScale.domain([0, d3.max(data, function(d) { return d.asylumApplications; })]);
    this.yAxis.scale(this.yScale);
    this.svg.select('.y')
      .call(this.yAxis);

    var rects = this.svg.selectAll(".timebar")
        .data(data);

    rects.enter().append("rect")
        .attr("class", "timebar");

    // appending after enter() selection is both enter() + append() selections
    rects.attr("y", d => this.yScale(d.asylumApplications))
         .attr("x", d => this.xScale(d.date))
         .attr("width", Math.ceil(this.width/data.length))
         .attr("height", d => this.height - this.yScale(d.asylumApplications))
         .attr("fill", d => {
           if (!this.isEuroCountrySelected()) {
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
