
var React = require('react');
var Translate = require('react-translate-component');
var translate = require('counterpart');
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
    onTimeRangeChange: React.PropTypes.func,
    locale: React.PropTypes.string
  },


  getHeight: function() {
    return 180;
  },


  getMargins: function() {
    return {
      top: 50,
      right: 30,
      bottom: 30,
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


  getIncompleteDataIndices: function() {
    if (this.isEuroCountrySelected()) return [];

    var timestamp = moment(refugeeConstants.DATA_END_MOMENT);
    var missingDataIndices = [];

    while (timestamp.isAfter(refugeeConstants.DATA_START_MOMENT)) {
      if (this.props.refugeeCountsModel
        .getDestinationCountriesWithMissingData(timestamp).length > 0) {
        missingDataIndices.push(DataTools.dateToMonthIndex(timestamp.toDate()));
      }

      timestamp.subtract(1, 'months');
    }

    return missingDataIndices;
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
        key: DataTools.dateToMonthIndex(d.date.toDate()),
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


  ticks: function() {
    return d3.range(2012, 2017).map(DataTools.firstMonthIndexOfYear);
  },


  tickFormat: function(monthIndex) {
    return 1900 + DataTools.monthIndexToDate(monthIndex).getYear();
  },


  // this.props.timeRange is in the format of seconds since the epoch (i.e.
  // moment.unix()). The first date is the beginning of the month, while the
  // last is the last second the of the last month.
  getMonthIndexRange: function() {
    return this.props.timeRange.map(function(secondsSinceEpoch) {
      return DataTools.dateToMonthIndex(new Date(secondsSinceEpoch * 1000));
    });
  },


  // We need to return the beginning of the month for the start time and
  // end of the month for the end time.
  getTimeRangeForMonthIndexRange: function(indexRange) {
    return [
      DataTools.monthIndexToDate(indexRange[0]).getTime() / 1000,
      moment(DataTools.monthIndexToDate(indexRange[1])).endOf('month').unix()
    ];
  },


  // FIXME: misleading function name. Returns the title of the map, not missing data label
  getCountriesWithMissingData: function() {
    var formattedCountryList = function(countryList) {
      var missingDataText = '';
      var countryCount = countryList.length;

      if (countryCount > 0) {
        missingDataText = translate('asylum_countries.data_missing') + ': ';

        if (countryCount > 5) {
          missingDataText += countryList.slice(0, 4).join(', ') + ' ja ' +
            (countryCount - 4) + ' ' + translate('asylum_countries.other_countries');
        } else {
          if (countryCount > 1) {
            missingDataText += countryList.slice(0, countryCount - 1).join(', ') +
              ' ' + translate('asylum_countries.and') + ' ';
          }
          missingDataText += countryList[countryCount - 1];
        }
      }

      return missingDataText;
    };

    var tooltipForCountryList = function(countryList) {
      if (countryList.length > 0) {
        return translate('asylum_countries.data_missing_following_countries') +
          ': ' + countryList.join(', ');
      } else {
        return '';
      }
    };

    if (this.isEuroCountrySelected()) {
      var countryName = this.props.mapModel.getFriendlyNameForCountry(this.props.country, this.props.locale);

      return (
        <Translate className="refugee-map-time__missing-data"
          attributes={{ title: 'asylum_countries.left_applications_in_country' }}
          content='asylum_countries.left_applications_in_country_bolded'
          country={countryName}
          unsafe
        />
      );
    }

    var countriesWithMissingData = this.props.refugeeCountsModel
      .getDestinationCountriesWithMissingDataForTimeRange(this.props.timeRange)
      .map(item => this.props.mapModel.getFriendlyNameForCountry(item, this.props.locale));

    return (
      <span className="refugee-map-time__missing-data"
        title={tooltipForCountryList(countriesWithMissingData)}
      >
        <Translate content="asylum_countries.asylum_seekers_arrived_in_europe" />
        <span className="missing-data-real">
          {formattedCountryList(countriesWithMissingData)}
        </span>
      </span>
    );
  },


  handleTimeRangeChange: function(indexRange) {
    if (this.props.onTimeRangeChange) {
      var timeRange = this.getTimeRangeForMonthIndexRange(indexRange);
      this.props.onTimeRangeChange(timeRange);
    }
  },


  render: function() {
    return (
      <div className='refugee-map-time'>
        {this.getCountriesWithMissingData()}
        <BarChartRangeSelector className='refugee-map-time__chart'
          xTickFormat={this.tickFormat}
          xTickValues={this.ticks()}
          rangeFormat={DataTools.formatMonthIndex}
          onChange={this.handleTimeRangeChange}
          selectedRange={this.getMonthIndexRange()}
          data={this.getSourceData()}
          incompleteDataIndices={this.getIncompleteDataIndices()}
          height={this.getHeight()}
          width={this.props.width}
          margin={this.getMargins()} />
      </div>
    );
  }

});

module.exports = RefugeeMapTimeBarChart;
