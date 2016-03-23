
var React = require('react');
var _ = require('underscore');

var refugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMapCountryCountsLayer = React.createClass({

  propTypes: {
    country: React.PropTypes.string,
    projection: React.PropTypes.func,
    mapModel: React.PropTypes.object,
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    originCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    destinationCountries: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  renderText: function(country, count, type) {
    if (this.props.country === null) {
      return null;
    }

    var point = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));

    return (
      <text key={country} x={point[0]} y={point[1] + 30} className={type}>
        {count}
      </text>
    );
  },


  renderTexts: function() {
    var items = [];

    if (this.props.width > refugeeConstants.labelShowBreakPoint) {
      var counts = this.props.refugeeCountsModel
        .getDestinationCountsByOriginCountries(this.props.country, this.props.timeRange);

      var totalReceivedCount = 0;
      var totalLeftCount = 0;

      _.difference(this.props.originCountries, refugeeConstants.disableLabels)
        .forEach(function(country) {
          var cc = counts[country];
          if (cc != null) {
            var val = cc.asylumApplications;
            items.push(this.renderText(country, -val, 'origin'));
            totalReceivedCount += val;
          }
        }.bind(this));

      counts = this.props.refugeeCountsModel
        .getOriginCountsByDestinationCountries(this.props.country, this.props.timeRange);

      _.difference(this.props.destinationCountries, refugeeConstants.disableLabels)
        .forEach(function(country) {
          var cc = counts[country];
          if (cc != null) {
            var val = cc.asylumApplications;
            items.push(this.renderText(country, cc.asylumApplications, 'destination'));
            totalLeftCount += val;
          }
        }.bind(this));
    }

    // On the hovered country we show either the amount of
    // people received of the amount of people who have left
    //
    // Some countries both receive and generate asylum seekers
    // in most cases the other count is much larger, and
    // each country is either mainly a receiver or originator
    // country.
    //
    // For such countries it is appropriate to simply know
    // whichever count is bigger
    //
    // Serbia is however a problem, as both numbers are similar
    // and the balance even shifts along the way
    //
    var count = totalReceivedCount - totalLeftCount;

    if (isFinite(count) && count != 0 && this.props.country !== 'SRB') {
      items.push(this.renderText(this.props.country, count, 'selected'));
    }

    return items;
  },


  shouldComponentUpdate: function(nextProps, _nextState) {
    if (nextProps.country !== this.props.country ||
        nextProps.timeRange !== this.props.timeRange) {
      return true;
    }
    return false;
  },


  render: function() {
    return (
      <svg className="refugee-map-country-counts-layer"
        style={{width: this.props.width, height: this.props.height}}>
        {this.renderTexts()}
      </svg>
    );
  }

});


module.exports = RefugeeMapCountryCountsLayer;
