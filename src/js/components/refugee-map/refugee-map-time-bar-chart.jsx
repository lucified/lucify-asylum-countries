
var React = require('react');
var moment = require('moment');
var d3 = require('d3');

var BarChartRangeSelector = require('lucify-bar-chart-range-selector').default;
var DataTools = require('lucify-data-tools');

var refugeeConstants = require('../../model/refugee-constants.js');

var RefugeeMapTimeBarChart = React.createClass({

  propTypes: {
    country: React.PropTypes.string,
    countryFigures: React.PropTypes.object,
    mapModel: React.PropTypes.object,
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    width: React.PropTypes.number,
    onTimeRangeChange: React.PropTypes.func
  },


  getHeight: function() {
    return 200;
  },


  getMargins: function() {
    return {
      top: 50,
      right: 30,
      bottom: 50,
      left: 60
    };
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
          missingDataText = 'Dataa puuttuu: ' +
            countryList.slice(0, 4).join(', ') + ' ja ' +
            (countryCount - 4) + ' muuta maata';
        } else {
          missingDataText = 'Dataa puuttuu: ';
          if (countryCount > 1) {
            missingDataText += countryList.slice(0, countryCount - 1).join(', ') +
              ' ja ';
          }
          missingDataText += countryList[countryCount - 1];
        }
      }

      return 'Eurooppaan saapuneet turvapaikanhakijat <span class="missing-data-real">' +
        missingDataText + '</span>';
    }.bind(this);

    var tooltipForCountryList = function(countryList) {
      if (countryList.length > 0) {
        return 'Dataa puuttuu seuraavista maista: ' + countryList.join(', ');
      } else {
        return '';
      }
    }.bind(this);

    if (this.isEuroCountrySelected()) {
      this.labelSelection
        .attr('title', 'Maahan ' +
          this.props.mapModel.getFriendlyNameForCountry(this.props.country) +
          ' turvapaikkahakemuksen jättäneet')
        .html('Maahan <b>' +
          this.props.mapModel.getFriendlyNameForCountry(this.props.country) +
          '</b> turvapaikkahakemuksen jättäneet');
    } else {
      var countriesWithMissingData = this.props.refugeeCountsModel
        .getDestinationCountriesWithMissingDataForTimeRange(timeRange)
        .map(item => this.props.mapModel.getFriendlyNameForCountry(item));

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
    var data;

    if (!this.isEuroCountrySelected()) {
      data = this.props.refugeeCountsModel.getGlobalArrivingPerMonth();
    } else {
      data = this.props.refugeeCountsModel.getGlobalArrivingPerMonthForCountry(this.props.country);
    }

    return data.map(function(d) {
      return {
        key: DataTools.dateToMonthIndex(d.date),
        total: d.asylumApplications,
        values: [
          {
            key: 'asylum applications',
            values: d.asylumApplications
          }
        ]
      };
    });
  },


  componentDidMount: function() {
    this.labelSelection = d3.select(this.refs.missingData.getDOMNode());
    this.updateCountriesWithMissingData(this.props.timeRange);
  },


  componentDidUpdate: function() {
    this.updateCountriesWithMissingData(this.props.timeRange);
  },


/*  initializeChart: function(data) {
    var margin = this.getMargins();
    this.height = this.getHeight() - margin.top - margin.bottom;
    this.width = this.props.width - margin.left - margin.right;

    // convert moments to Dates
    data = data.map(function(d) {
      return {
        date: d.date.toDate(),
        asylumApplications: d.asylumApplications
      };
    });

    this.xScale = d3.time.scale();
    this.yScale = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
        .orient('bottom')
        .tickFormat(d3.time.format('%Y'))
        .ticks(d3.time.months, 12)
        .tickSize(5, 5);

    this.yAxis = d3.svg.axis()
        .scale(this.yScale)
        .orient('left')
        .tickFormat(d3.format('s'))
        .ticks(3)
        .tickSize(4, 0);

    this.svg = d3.select(React.findDOMNode(this.refs.chart))
        .attr('width', this.width + margin.left + margin.right)
        .attr('height', this.height + margin.top + margin.bottom)
      .append('g')
        .attr('transform',
              'translate(' + margin.left + ',' + margin.top + ')');

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

    this.svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + this.height + ')')
        .call(this.xAxis);

    this.svg.append('g')
        .attr('class', 'y axis')
        .call(this.yAxis);

    this.updateWithData(data);
  },


  updateWithData: function(data) {
    var margin = this.getMargins();
    this.width = this.props.width - margin.left - margin.right;
    this.svg.attr('width', this.width + margin.left + margin.right);

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

    var rects = this.svg.selectAll('.timebar')
        .data(data);

    rects.enter().append('rect')
        .attr('class', 'timebar');

    // appending after enter() selection is both enter() + append() selections
    rects.attr('y', d => this.yScale(d.asylumApplications))
         .attr('x', d => this.xScale(d.date))
         .attr('width', Math.ceil(this.width/data.length))
         .attr('height', d => this.height - this.yScale(d.asylumApplications))
         .attr('fill', d => {
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
*/

  ticks: function() {
    return d3.range(2012, 2017).map(DataTools.firstMonthIndexOfYear);
  },


  tickFormat: function(monthIndex) {
    return 1900 + DataTools.monthIndexToDate(monthIndex).getYear();
  },


  getMonthIndexRange: function() {
    return this.props.timeRange.map(function(secondsSinceEpoch) {
      return DataTools.dateToMonthIndex(new Date(secondsSinceEpoch * 1000));
    });
  },


  handleTimeRangeChange: function(indexRange) {
    // timeRange needs to be in seconds since epoch
    var timeRange = indexRange.map(function(monthIndex) {
      return DataTools.monthIndexToDate(monthIndex).getTime() / 1000;
    });

    this.updateCountriesWithMissingData(timeRange);


    if (this.props.onTimeRangeChange) {
      this.props.onTimeRangeChange(timeRange);
    }
  },


  render: function() {
    return (
      <div className='refugee-map-time'>
        <span ref="missingData" className="refugee-map-time__missing-data" />
        <BarChartRangeSelector className='refugee-map-time__chart'
          xTickFormat={this.tickFormat}
          xTickValues={this.ticks()}
          rangeFormat={DataTools.formatMonthIndex}
          onChange={this.handleTimeRangeChange}
          selectedRange={this.getMonthIndexRange()}
          data={this.getSourceData()}
          height={this.getHeight()}
          width={this.props.width}
          margin={this.getMargins()} />
      </div>
    );
  }

});

module.exports = RefugeeMapTimeBarChart;
