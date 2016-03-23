
var React = require('react');
var _ = require('underscore');
var extend = require('object-extend');

var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');
var d3 = require('d3');

var RefugeesBarChart = React.createClass({

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    format: React.PropTypes.func,
    getValue: React.PropTypes.func,
    countryFigures: React.PropTypes.object,
    mapModel: React.PropTypes.object,
    max: React.PropTypes.number
  },


  getDataValues: function() {
    if (!this.props.refugeeCountsModel) {
      return null;
    }

    return this.getEuroFigures().map(this.props.getValue);
  },


  getData: function(){

    var baseData = {
      columns: [],
      types: {
        data1: 'bar'
      },
      labels: {
        show: true,
        format: this.props.format
      }
    };

    if (!this.props.refugeeCountsModel) {
      return baseData;
    }

    var data = {
      columns: [['data1'].concat(this.getDataValues())],
      colors: {
        data1: 'rgb(130, 196, 217)'
        //data1: 'rgb(10, 187, 239)'
      }
    };

    return extend(baseData, data);
  },


  getEuroFigures: function() {
    return this.props.refugeeCountsModel.getEuroFigures(this.props.countryFigures, 20);
  },


  getCategories: function() {
    var ret = this.getEuroFigures().map(item => {
      return this.props.mapModel.getFriendlyNameForCountry(item.country);
    });
    return ret;
  },


  componentDidUpdate: function() {
    d3.select(this.getDOMNode())
      .selectAll('.c3-text')
      .style('font-size', '14px')
      .attr('dx', '2px')
      .attr('fill', 'black');
  },


  getMax: function() {
    if (!this.props.max) {
      return _.reduce(this.getDataValues(), function(prev, curr) {
        return Math.max(prev, curr);
      }, 0);
    }
    return this.props.max;
  },


  getSpec: function() {
    return {
      interaction: {
        enabled: false
      },
      padding: {
        top: 0,
        right: 40,
        bottom: 0,
        left: 120
      },
      axis: {
        x: {
          type: 'category',
          categories: this.getCategories()
        },
        y: {
          show: false,
          max: this.getMax()
        },
        rotated: true
      },
      transition: {
        duration: 200
      },
      legend: {
        show: false
      }
    };
  },


  adjustY: function() {
    if (this.refs.theChart != null) {
      this.refs.theChart.chart.axis.max({
        y: this.getMax()
      });
    }
  },


  render: function() {
    if (!this.props.mapModel) {
      return <div />;
    }

    var data = this.getData();
    var spec = this.getSpec();

    return (
      <div className="refugees-bar-chart">
        <C3Chart
          ref="theChart"
          data={data}
          onUpdateData={this.adjustY}
          slowUpdateDebounceTime={0}
          fastUpdateDebounceTime={0}
          spec={spec} aspectRatio={1.0} />
      </div>
    );

  }


});


module.exports = RefugeesBarChart;
