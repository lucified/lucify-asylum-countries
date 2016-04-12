
var React = require('react');
var Translate = require('react-translate-component');
var d3 = require('d3');
var legend = require('d3-svg-legend/no-extend');

var utils = require('../../utils.js');

// the d3-svg-legend components for some
// reason seems to need a global d3
window.d3 = d3;


var ColorsLegend = React.createClass({

  propTypes: {
    countData: React.PropTypes.object,
    locale: React.PropTypes.string,
    tightSpacing: React.PropTypes.bool
  },


  getDefaultProps() {
    return {
      orientation: 'vertical'
    };
  },


  componentWillMount() {
    this.format = (this.props.locale === 'fi') ?
      utils.d3FiLocale.numberFormat('n') :
      d3.format('n');
  },


  shouldComponentUpdate(nextProps, _nextState) {
    return nextProps.countData !== this.props.countData ||
      nextProps.locale !== this.props.locale ||
      nextProps.tightSpacing !== this.props.tightSpacing;
  },


  componentDidUpdate: function() {
    this.update();
  },


  componentDidMount: function() {
    this.update();
  },


  getLegendItemHeight: function() {
    return this.props.tightSpacing ? 15 : 30;
  },


  getLegendItemCount: function() {
    return this.props.countData && this.props.countData.destinationScale.range().length;
  },


  update: function() {
    if (!this.props.countData) {
      return;
    }

    var colorLegend = legend.color()
        .labelFormat(value => this.format(Math.round(value)))
        .labelDelimiter('–')
        .useClass(false)
        .shapeHeight(this.getLegendItemHeight())
        .shapePadding(0)
        .scale(this.props.countData.destinationScale);

    d3.select(React.findDOMNode(this.refs.legend))
      .call(colorLegend);
  },


  render: function() {
    var svgWidth = this.props.tightSpacing ? 90 : 110;
    var svgHeight = this.getLegendItemHeight() * this.getLegendItemCount();

    return (
      <div className={'colors-legend ' + this.props.className}>
        <div className="colors-legend__inner">
          <div className="colors-legend__title">
            <Translate content="asylum_countries.asylum_seekers_per" />
            <br />
            <Translate content="asylum_countries.hundred_thousand_inhabitants" />
          </div>
          <div className="colors-legend-boxes">
            <svg style={{ width: svgWidth, height: svgHeight }}>
              <g ref="legend" />
            </svg>
          </div>
        </div>
      </div>
    );

  }

});

module.exports = ColorsLegend;
