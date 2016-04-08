
var React = require('react');

var counterpart = require('counterpart');

var Loading = require('lucify-commons/src/js/components/loading.jsx');
var HideableContainer = require('lucify-commons/src/js/components/hideable-container.jsx');

var Decorator = require('./refugee-context-decorator.jsx');
var RefugeeMapSegment = require('./refugee-map/refugee-map-segment.jsx');
var RefugeeMultiplesSegment = require('./refugee-map/refugee-multiples-segment.jsx');

counterpart.registerTranslations('fi', require('../locales/fi'));
counterpart.registerTranslations('en', require('../locales/en'));


var RefugeeMainContent = React.createClass({

  propTypes: {
    mapEnabled: React.PropTypes.bool,
    loaded: React.PropTypes.bool,
    loadProgress: React.PropTypes.number
  },


  getDefaultProps: function() {
    return {
      mapEnabled: true
    };
  },


  componentWillMount() {
    // Finnish locale can be set with a ?fi URL parameter
    if (this.props.fi !== undefined) {
      counterpart.setLocale('fi');
    } else {
      counterpart.setLocale('en');
    }
  },


  getLocale: function() {
    return counterpart.getLocale();
  },


  getMapSegment: function() {
    if (this.props.mapEnabled) {
      return (
        <HideableContainer visible={this.props.loaded}>
          <RefugeeMapSegment {...this.props} locale={this.getLocale()} />
        </HideableContainer>
      );
    }
    return <div />;
  },


  getMultiplesSegment: function() {
    if (this.props.mapEnabled && this.props.loaded) {
      return (
        <HideableContainer visible={this.props.loaded}>
          <RefugeeMultiplesSegment {...this.props} locale={this.getLocale()} />
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

module.exports = Decorator(RefugeeMainContent);

