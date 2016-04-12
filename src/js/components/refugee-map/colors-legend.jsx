
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
    orientation: React.PropTypes.oneOf(['horizontal', 'vertical']),
    width: React.PropTypes.number
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
      nextProps.orientation !== this.props.orientation ||
      nextProps.width !== this.props.width;
  },


  componentDidUpdate: function() {
    this.update();
  },


  componentDidMount: function() {
    this.update();
  },



  update: function() {
    if (!this.props.countData) {
      return;
    }

    var colorLegend = legend.color()
        .labelFormat(value => this.format(Math.round(value)))
        .labelDelimiter('–')
        .orient(this.props.orientation)
        .useClass(false)
        .shapeHeight(30)
        .shapePadding(0)
        .scale(this.props.countData.destinationScale);

    d3.select(React.findDOMNode(this.refs.legend))
      .call(colorLegend);
  },


  render: function() {
    var style = (this.props.orientation === 'vertical') ?
      { width: 110, height: 270 } : { width: this.props.width, height: 100 };

    return (
      <div className={'colors-legend ' + this.props.className}>
        <div className="colors-legend__inner">
          <div className="colors-legend__title">
            <Translate content="asylum_countries.asylum_seekers_per" />
            <br />
            <Translate content="asylum_countries.hundred_thousand_inhabitants" />
          </div>
          <div className="colors-legend-boxes">
            <svg style={style}>
              <g ref="legend" />
            </svg>
          </div>
        </div>
      </div>
    );

  }

});

module.exports = ColorsLegend;
