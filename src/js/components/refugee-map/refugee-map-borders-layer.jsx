
var React = require('react');
var d3 = require('d3');
var classNames = require('classnames');
var _ = require('underscore');
var sprintf = require('sprintf');
var console = require("console-browserify");



var getFullCount = function(counts) {
  if (!counts) {
    return 0;
  }

  return counts.asylumApplications;
};



var RefugeeMapBorder = React.createClass({


  componentDidMount: function() {
    this.sel = d3.select(React.findDOMNode(this.refs.overlay));
  },


  componentWillReceiveProps: function(nextProps, nextState) {
    this.sel
        .classed('subunit--hovered', nextProps.hovered)
        .classed('subunit--destination', nextProps.destination)
        .classed('subunit--origin', nextProps.origin);
    this.updateWithCountDetails(nextProps.countDetails);
  },


  updateWithCountDetails: function(details) {
    var fillStyle = null;
    if (details != null && this.props.origin && getFullCount(details.originCounts) > 0) {
       fillStyle = sprintf('rgba(190, 88, 179, %.2f)', details.originScale(getFullCount(details.originCounts)));
    } else if (details != null && this.props.destination && getFullCount(details.destinationCounts) > 0) {
       fillStyle = sprintf('rgba(95, 196, 114, %.2f)', details.destinationScale(getFullCount(details.destinationCounts)));
    }
    this.sel.style('fill', fillStyle);
  },


  shouldComponentUpdate: function(nextProps, nextState) {
    // it is important to prevent an expensive diff of the svg path
    // a react render will only be needed if we need to resize
    return this.props.width !== nextProps.width;
  },


  onMouseOver: function(){
    this.props.onMouseOver(this.props.country);
  },


  onMouseLeave: function(){
    this.props.onMouseLeave(this.props.country);
  },


  render: function() {

    // round pixels using a custom rendering context
    var d = "";
    var context = {
      beginPath: function() {
        d += "";
      },
      moveTo: function(x, y) {
        d += "M" + Math.round(x) + "," + Math.round(y);
      },
      lineTo: function(x, y) {
        d += "L" + Math.round(x) + "," + Math.round(y);
      },
      closePath: function() {
        d += "Z";
      },
      arc: function() {
        d += "";
      }
    };

    var path = this.props.path;
    path.context(context);
    path(this.props.feature);

    var country = this.props.country;
    var overlay = this.props.enableOverlay ? (
        <path key="p2" ref="overlay"
              className="subunit--overlay"
              onMouseOver={this.onMouseOver}
              onMouseLeave={this.onMouseLeave}
              d={d} />
      ) : null;

    return (
      <g>
        <path key="p1"
           className={this.props.subunitClass}
           d={d}
           onMouseOver={this.onMouseOver}
           onMouseLeave={this.onMouseLeave} />
        {overlay}
      </g>
    );

  }

});



var RefugeeMapBordersLayer = React.createClass({


  getDefaultProps: function() {
    return {
      subunitClass: 'subunit',
      updatesEnabled: true
    };
  },

  onMouseOver: function(country) {
    //console.log("over country" + country);
    if (this.props.onMouseOver) {
       this.props.onMouseOver(country);
    }
  },

  onMouseLeave: function(country) {
    //console.log("out of country" + country);
    if (this.props.onMouseLeave) {
       this.props.onMouseLeave(country);
    }
  },


  onClick: function() {
    if (this.props.onClick) {
       this.props.onClick();
    }
  },


  getHighlightParams: function(country) {
    if (!this.props.country) {
        return {
          destination: true,
          origin: false
        }
    };

    return {
       hovered: this.props.country == country,
       destination: this.props.destinationCountries.indexOf(country) != -1,
       origin: this.props.originCountries.indexOf(country) != -1
    };
  },





   /*
    * Get count data for current
    * this.props.country within this.props.timeRange
    *
    * Count data is an object containing:
    *   originCounts        -- array of counts of by originCountry
    *   destinationCounts   -- array of counts of by destinationCountry
    */
  getCountrySpecificCountData: function() {

    var timeRange = this.props.timeRange;

    var getMaxCount = function(counts) {
       return _.values(counts).reduce(function(prev, item) {
          return Math.max(prev, item.asylumApplications);
       },0);
    };

    var countData = null;
    var exponent = 0.5;

    if (this.props.country != null) {
      var originCounts = this.props.refugeeCountsModel
          .getDestinationCountsByOriginCountries(this.props.country, timeRange);
      var maxOriginCount = getMaxCount(originCounts);

      var destinationCounts = this.props.refugeeCountsModel
        .getOriginCountsByDestinationCountries(this.props.country, timeRange);
      var maxDestinationCount = getMaxCount(destinationCounts);

      var originScale = d3.scale.pow()
        .exponent(exponent).domain([0, maxOriginCount]).range([0.075, 0.80]);
      var destinationScale = d3.scale.pow()
        .exponent(exponent).domain([1, maxDestinationCount]).range([0.075, 0.80]);

      countData = {
        originCounts: originCounts,
        destinationCounts: destinationCounts,
        originScale: originScale,
        destinationScale: destinationScale
      };
    } else {

    }
    return countData;
  },


  getGlobalCountData: function() {
      var destinationCounts = this.props.refugeeCountsModel
        .getTotalDestinationCountsByCountries(this.props.timeRange);
      var maxDestinationCount = this.getMaxCount(destinationCounts);
      var exponent = 0.5;
      var destinationScale = d3.scale.pow()
        .exponent(exponent).domain([1, maxDestinationCount]).range([0.075, 0.80]);
      var countData = {
        originCounts: {},
        destinationCounts: destinationCounts,
        originScale: null,
        destinationScale: destinationScale
      };
      return countData;
  },


  getMaxCount: function(counts) {
    return _.values(counts).reduce(function(prev, item) {
        return Math.max(prev, item.asylumApplications);
    }, 0);
  },


  getCountData: function() {
      if (!this.props.refugeeCountsModel) {
        return null;
      }

      if (this.props.country != null) {
          return this.getCountrySpecificCountData();
      }
      return this.getGlobalCountData();
  },


   /*
    * Get paths representing map borders
    */
  getPaths: function() {

    var countries = {};

    // while we use React to manage the DOM,
    // we still use D3 to calculate the path
    var path = d3.geo.path().projection(this.props.projection);
    var countData = this.getCountData();

    return this.props.mapModel.featureData.features.map(function(feature) {
      var country = feature.properties.ADM0_A3;
      var hparams = this.getHighlightParams(country);

      if (countries[country]) {
        console.log("duplicate for " + country);
      }
      countries[country] = true;

      var countDetails = null;
      if (countData != null) {
        countDetails = {
          originScale: countData.originScale,
          destinationScale: countData.destinationScale,
          destinationCounts: countData.destinationCounts[country],
          originCounts: countData.originCounts[country]
        };
      }

      return (
        <RefugeeMapBorder
          ref={country}
          enableOverlay={this.props.enableOverlay}
          subunitClass={this.props.subunitClass}
          key={country}
          onMouseLeave={this.onMouseLeave}
          onMouseOver={this.onMouseOver}
          path={path}
          feature={feature}
          country={country}
          width={this.props.width}
          countDetails={countDetails}
          hovered={this.props.country == country}
          destination={countData != null && countDetails.destinationCounts != null && countDetails.asylumApplications != 0}
          origin={countData != null && countDetails.originCounts != null && countDetails.asylumApplications != 0} />
      );
    }.bind(this));
  },


  shouldComponentUpdate: function(nextProps, nextState) {
    if (this.props.width !== nextProps.width) {
      return true;
    }

    if (!this.props.updatesEnabled) {
      return false;
    }

    if (nextProps.country !== this.props.country) {
      return true;
    }

    if (nextProps.timeRange !== this.props.timeRange) {
      return true;
    }

    return false;
  },


  render: function() {
    return (
      <svg className="refugee-map-borders-layer"
        style={{width: this.props.width, height: this.props.height}}
        onClick={this.onClick}>
        {this.getPaths()}
      </svg>
    );
  },



});


module.exports = RefugeeMapBordersLayer;
