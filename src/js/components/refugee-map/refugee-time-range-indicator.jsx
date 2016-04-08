
var React = require('react');
var moment = require('moment');


var RefugeeTimeRangeIndicator = React.createClass({

  propTypes: {
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    locale: React.PropTypes.string
  },

  componentWillMount() {
    if (this.props.locale === 'fi') {
      this.dateNames = require('date-names/fi');
    } else {
      this.dateNames = require('date-names/en');
    }
  },

  getMonthString: function(mom) {
    return this.dateNames.abbreviated_months[mom.month()] + ' ' + mom.format('YYYY');
  },

  displayTimeRange: function(timeRange) {
    var startMoment = moment.unix(timeRange[0]);
    var endMoment = moment.unix(timeRange[1]);

    if (startMoment.month() == endMoment.month() &&
        startMoment.year() == endMoment.year()) {
      return this.getMonthString(startMoment);
    } else {
      return this.getMonthString(startMoment) + ' - ' +
        this.getMonthString(endMoment);
    }
  },

  render: function() {
    return (
      <div className="refugee-time-range-indicator">
        {this.displayTimeRange(this.props.timeRange)}
      </div>
    );
  }


});


module.exports = RefugeeTimeRangeIndicator;
