
var React = require('react');

var RefugeeMapTimeBarChart = require('./refugee-map-time-bar-chart.jsx');

var RefugeeMapTimeLayer = React.createClass({


	getInitialState: function() {
		return {};
	},

	render: function() {
		if (!this.props.refugeeCountsModel) {
			return <div />;
		}

		return (
			<div className='refugee-map-time-layer'>
				<RefugeeMapTimeBarChart {...this.props} timeRange={this.props.timeRange} />
			</div>
		);
	}

});

module.exports = RefugeeMapTimeLayer;
