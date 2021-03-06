
var React = require('react');
var d3 = require('d3');

var refugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMapCountBar = React.createClass({

  propTypes: {
    country: React.PropTypes.string,
    refugeeCountsModel: React.PropTypes.object,
    mapModel: React.PropTypes.object,
    scale: React.PropTypes.func,
    projection: React.PropTypes.func,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number)
  },

  // for some reason Safari
  // slows down a lot when these
  // updates are rendered with
  // React, so we use D3 instead

  updateForTimeRange: function(timeRange) {
    var country = this.props.country;
    var refugeeCounts = this.props.refugeeCountsModel.getTotalDestinationCounts(country, timeRange);
    var asylumBarSize = this.props.scale(refugeeCounts.asylumApplications);
    var coordinates = this.props.projection(this.props.mapModel.getCenterPointOfCountry(country));

    this.asylumSel
        .attr('y', coordinates[1] - asylumBarSize);
    this.asylumSel
        .attr('height', asylumBarSize);
    this.asylumSel
        .attr('x', coordinates[0] - 2);
    this.asylumSel
        .style('display', asylumBarSize > 0 ? 'initial' : 'none');
  },

  shouldComponentUpdate: function(nextProps) {
    return (this.props.height !== nextProps.height
      || this.props.projection !== nextProps.projection
      || this.props.timeRange !== nextProps.timeRange);
  },


  componentDidMount: function() {
    this.asylumSel = d3.select(React.findDOMNode(this.refs.asylumBar));
    this.updateForTimeRange(this.props.timeRange);
  },


  componentDidUpdate: function() {
    this.updateForTimeRange(this.props.timeRange);
  },


  render: function() {
    var country = this.props.country;
    var width = Math.max(3, Math.round(5 * this.props.width / 1000));

    return (
      <g key={country}>
        <rect
           ref="asylumBar"
           key="asylum-bar"
           className="asylum-bar"
           width={width}
           x={0}
           height={0}
           y={0} />
      </g>
    );
  }

});



var RefugeeMapCountBarsLayer = React.createClass({

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    projection: React.PropTypes.func,
    mapModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    highlightedCountry: React.PropTypes.string
  },

  getTotal: function() {
    if (!this._total) {
      var range = [
        refugeeConstants.DATA_START_MOMENT.unix(),
        refugeeConstants.DATA_END_MOMENT.unix()
      ];
      this._total = this.props.refugeeCountsModel
        .getTotalDestinationCounts('DEU', range).asylumApplications;
    }

    return this._total;
  },


  getBarSizeScale: function() {
    // this scale work as long as germany is in the
    // lead and we use the current map projection+position
    return d3.scale.linear()
      .domain([0, this.getTotal()])
      .range([0, this.props.height * 0.2]);
  },


  getBarItems: function() {
    var items = [];
    var countries = this.props.refugeeCountsModel.getDestinationCountries();

    var props = {
      refugeeCountsModel: this.props.refugeeCountsModel,
      projection: this.props.projection,
      mapModel: this.props.mapModel,
      scale: this.getBarSizeScale(),
      width: this.props.width,
      height: this.props.height,
      timeRange: this.props.timeRange
    };

    if (this.props.highlightedCountry != null) {
      if (countries.indexOf(this.props.highlightedCountry) != -1) {
        items.push(
          <RefugeeMapCountBar ref={this.props.highlightedCountry}
            key={this.props.highlightedCountry + '_'}
            {...props}
            country={this.props.highlightedCountry} />
        );
      }
    } else {
      countries.forEach(function(country) {
        items.push(
          <RefugeeMapCountBar ref={country}
            key={country}
            {...props}
            country={country} />);
      }.bind(this));
    }

    return items;
  },


  shouldComponentUpdate: function(nextProps) {
    return (this.props.highlightedCountry !== nextProps.highlightedCountry
      || this.props.width !== nextProps.width
      || this.props.projection !== nextProps.projection
      || this.props.timeRange !== nextProps.timeRange);
  },


  render: function() {
    return (
       <svg className="refugee-map-count-bars-layer"
           style={{width: this.props.width, height: this.props.height}}>
           {this.getBarItems()}
       </svg>
    );
  }

});


module.exports = RefugeeMapCountBarsLayer;
