
var React = require('react');

var RefugeeMapTimeBarChart = require('./refugee-map-time-bar-chart.jsx');

var RefugeeMapTimeLayer = React.createClass({

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number)
  },

  getInitialState: function() {
    return {};
  },

  render: function() {
    if (!this.props.refugeeCountsModel) {
      return <div />;
    }

    return (
      <div className='refugee-map-time-layer'>
        <RefugeeMapTimeBarChart {...this.props} />
      </div>
    );
  }

});

module.exports = RefugeeMapTimeLayer;
