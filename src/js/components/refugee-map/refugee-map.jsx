
var React = require('react');
var d3 = require('d3');

var BordersLayer = require('./refugee-map-borders-layer.jsx');
var CountryCountsLayer = require('./refugee-map-country-counts-layer.jsx');
var CountryLabelsLayer = require('./refugee-map-country-labels-layer.jsx');
var CountBarsLayer = require('./refugee-map-count-bars-layer.jsx');
var SimpleBordersLayer = require('./refugee-map-simple-borders-layer.jsx');
var DataUpdated = require('../refugee-data-updated.jsx');
var RefugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMap = React.createClass({

  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    interactionsEnabled: React.PropTypes.bool,
    lo: React.PropTypes.number,
    la: React.PropTypes.number,
    scale: React.PropTypes.number,
    preferredHeightWidthRatio: React.PropTypes.number,
    showDataUpdated: React.PropTypes.bool,
    mapModel: React.PropTypes.object,
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    countryFigures: React.PropTypes.object,
    onMouseOver: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMapClick: React.PropTypes.func,
    clickedCountry: React.PropTypes.string,
    country: React.PropTypes.string,
    originCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    destinationCountries: React.PropTypes.arrayOf(React.PropTypes.string),
    locale: React.PropTypes.string
  },


  getDefaultProps: function() {
    return {
      width: 1200,
      height: 1200,
      interactionsEnabled: true,
      lo: 22.2206322,
      la: 34.0485818,
      scale: 0.85,
      preferredHeightWidthRatio: 0.6,
      showDataUpdated: true,
      locale: 'en'
    };
  },


  getWidth: function() {
    return this.props.width;
  },


  getHeight: function() {
    return this.getSmartHeight();
  },


  componentWillUpdate: function(nextProps, _nextState) {
    if (this.props.width !== nextProps.width || this.props.la !== nextProps.la) {
      this._projection = null;
    }
  },


  getGraphHeight: function() {
    return 180 + 23 + 10;
  },


  getSmartHeight: function() {
    var height = Math.round(this.props.width * this.props.preferredHeightWidthRatio);
    var graphHeight = this.getGraphHeight();
    var chromeHeight = 100;
    if (screen.height > graphHeight * 2 + chromeHeight) {
      return Math.min(screen.height - chromeHeight - graphHeight, height);
    }
  },


  getAzimuthalEqualAreaProjection: function() {
    var lo = this.props.lo; // x
    var la = this.props.la; // y
    var scale = this.props.scale;

    return d3.geo.azimuthalEqualArea()
      .center([0, la])
      .rotate([-lo, 0])
      .scale(this.getHeight()*scale)
      .translate([this.getWidth() / 2, this.getHeight() / 2])
      .precision(1);
  },


  getProjection: function() {
    if (!this._projection){
      this._projection = this.getAzimuthalEqualAreaProjection();
    }
    return this._projection;
  },


  getStandardLayerParams: function() {
    return {
      mapModel: this.props.mapModel,
      projection: this.getProjection(),
      width: this.getWidth(),
      height: this.getHeight(),
      timeRange: this.getTimeRange()
    };
  },


  componentWillMount: function() {
    this.timeRange = this.props.timeRange;
  },


  getTimeRange: function() {
    return this.props.timeRange;
  },


  interactionsEnabled: function() {
    return this.props.interactionsEnabled;
  },


  getFirstBordersLayer: function() {
    if (this.interactionsEnabled()) {
      return (
        <BordersLayer
          ref="bordersLayer"
          updatesEnabled={true}
          enableOverlay={true}
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel}
          countryFigures={this.props.countryFigures}
          subunitClass="subunit"
          locale={this.props.locale}
        />
      );
    } else {
      return <SimpleBordersLayer {...this.getStandardLayerParams()} />;
    }
  },


  getSecondBordersLayer: function() {
    if (this.interactionsEnabled()) {
      return (
        <BordersLayer
          updatesEnabled={true}
          enableOverlay={true}
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          subunitClass="subunit-invisible"
          onMouseOver={this.props.onMouseOver}
          onMouseLeave={this.props.onMouseLeave}
          onClick={this.props.onMapClick}
          locale={this.props.locale}
        />
      );
    }
  },


  getCountryLabelsLayer: function() {
    if (this.interactionsEnabled()) {
      return (
        <CountryLabelsLayer
          ref="countryLabels"
          locale={this.props.locale}
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()} />
      );
    }
  },


  getCountryCountsLayer: function() {
    if (this.interactionsEnabled()) {
      return (
        <CountryCountsLayer
          ref="countsLayer"
          {...this.getStandardLayerParams()}
          {...this.getHighlightLayerParams()}
          refugeeCountsModel={this.props.refugeeCountsModel}
          locale={this.props.locale}
        />
      );
    }
  },


  getOverlayLayer: function() {
    if (this.interactionsEnabled()) {
      return null;
    }
    return (
      <div
        className="refugee-map__overlay-layer"
        style={{width: this.getWidth(), height: this.getHeight()}}>
      </div>
    );
  },


  getCountBarsLayer: function() {
    return (
      <CountBarsLayer
        ref="countBars"
        {...this.getStandardLayerParams()}
        highlightedCountry={this.getHighlightedCountry()}
        refugeeCountsModel={this.props.refugeeCountsModel}
      />
    );
  },


  getDataUpdated: function() {
    if (this.props.showDataUpdated) {
      return (
        <DataUpdated
          locale={this.props.locale}
          updatedAt={RefugeeConstants.ASYLUM_APPLICANTS_DATA_UPDATED_MOMENT}
        />
      );
    }
  },


  getHighlightLayerParams: function() {
    return {
      clickedCountry: this.props.clickedCountry,
      country: this.props.country,
      originCountries: this.props.originCountries,
      destinationCountries: this.props.destinationCountries
    };
  },

  getHighlightedCountry: function() {
    return this.props.country;
  },

  render: function() {
    if (!this.props.refugeeCountsModel || !this.props.mapModel) {
      return (
        <div className="refugee-map"
          style={{width: this.getWidth(), height: this.getHeight()}}>
          <div className="refugee-map__loading">Loading...</div>
        </div>
      );
    }

    return (
      <div className="refugee-map"
        style={{width: this.getWidth(), height: this.getHeight()}}>

        {this.getFirstBordersLayer()}

        {this.getCountBarsLayer()}

        {this.getCountryLabelsLayer()}
        {this.getCountryCountsLayer()}

        {this.getSecondBordersLayer()}

        {this.getOverlayLayer()}

        {this.getDataUpdated()}
      </div>
    );
  }
});


module.exports = RefugeeMap;
