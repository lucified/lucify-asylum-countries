
var React = require('react');
var moment = require('moment');


var RefugeeTimeRangeIndicator = React.createClass({

  displayTimeRange: function(timeRange) {
    var startMoment = moment.unix(timeRange[0]);
    var endMoment = moment.unix(timeRange[1]);

    if (startMoment.month() == endMoment.month() &&
        startMoment.year() == endMoment.year()) {
      return startMoment.format("MMM/YYYY");
    } else {
      return startMoment.format("MMM/YYYY") + " - " + endMoment.format("MMM/YYYY");
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
