
var React = require('react');
var moment = require('moment');
var names = require('date-names/fi');


var RefugeeTimeRangeIndicator = React.createClass({

  propTypes: {
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number)
  },

  getMonthString: function(mom) {
    return names.abbreviated_months[mom.month()] + ' ' + mom.format('YYYY');
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
