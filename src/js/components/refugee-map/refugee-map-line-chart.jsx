
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


  getFriendlyTime: function() {
    return moment(new Date(this.props.stamp * 1000)).format('DD.MM.YYYY');
  },


  shouldComponentUpdate: function() {
    return false;
  },


  // TODO: make it work with a range
  updateCountriesWithMissingData: function(stamp) {
    var timestampMoment = moment.unix(stamp);
    var res = this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()];

    if (res === undefined) {
      var countriesWithMissingData
        = this.props.refugeeCountsModel.getDestinationCountriesWithMissingData(timestampMoment);
      var length = countriesWithMissingData.length;
      if (length > 0) {
        var missingDataText;
        countriesWithMissingData = _.map(countriesWithMissingData, function(countryCode) {
          return this.props.mapModel.getFriendlyNameForCountry(countryCode);
        }.bind(this));
        if (length > 5) {
          missingDataText = "Missing data from " + countriesWithMissingData.slice(0, 4).join(', ') +
            " and " + (length - 4) + " other countries";
        } else {
          missingDataText = "Missing data from ";
          if (length > 1) {
             missingDataText += countriesWithMissingData.slice(0, length - 1).join(', ') +  " and ";
          }
          missingDataText += countriesWithMissingData[length - 1];
        }

        res = {
          title: "Missing data for " + countriesWithMissingData.join(', '),
          text: missingDataText
        };

      } else {
        res = {
          title: '',
          text: ''
        };
      }
      this.countriesWithMissingDataCache[timestampMoment.year() * 12 + timestampMoment.month()] = res;
    }

    this.labelSelection
      .attr('title', res.title)
      .text(res.text);
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
  },



  render: function() {
    return (
      <div className='refugee-map-line-chart'>
        <span ref="missingData" className="refugee-map-line-chart__missing-data" />
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
