
var React = require('react');

var HideableContainer = require('lucify-commons/src/js/components/hideable-container.jsx');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeMultiplesSegment = require('./refugee-map/refugee-multiples-segment.jsx');

var Loading = require('lucify-commons/src/js/components/loading.jsx');

//var WorkInProgress = require('./work-in-progress.jsx');
var UberProtection = require('lucify-commons/src/js/components/uber-protection.jsx');


var RefugeeMainContent = React.createClass({


	getDefaultProps: function() {
		return {
			mapEnabled: true
		}
	},


	getMapSegment: function() {
		if (this.props.mapEnabled) {
			return (
				<HideableContainer visible={this.props.loaded}>
					<RefugeeMapSegment {...this.props} />
				</HideableContainer>
			);
		}
		return <div />;
	},


	getMultiplesSegment: function() {
		if (this.props.mapEnabled && this.props.loaded) {
			return (
				<HideableContainer visible={this.props.loaded}>
					<RefugeeMultiplesSegment {...this.props} />
				</HideableContainer>
			);
		}
		return <div />;
	},


	getLoadingSegment: function() {
		if (!this.props.loaded) {
			return (
				<div className="lucify-container">
					<Loading progress={this.props.loadProgress} />
				</div>
			);
		}
	},


	render: function() {

		// providing a min-height will help the browser
		// to know that there will be a scrollbar
		//
		// this will help the browser to figure out the
		// correct width immediately without an extra
		// iteration

		return (
			<div className="refugee-main-content"
				style={{minHeight: 1000}}>
				{this.getLoadingSegment()}
				{this.getMapSegment()}
				{this.getMultiplesSegment()}
			</div>
		);

	}

});


module.exports = UberProtection(
	Decorator(RefugeeMainContent),
	'55b81c403099c4f9eda5592166cefc6f1ec5d58ed7806b93ec9941ede31ebf459298937694d3a8801a92106c648c27695ebcd9a3d337a4e581c17ae554711c09');
