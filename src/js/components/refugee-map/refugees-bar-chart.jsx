
var React = require('react');
var _ = require('underscore');
var sprintf = require('sprintf');
var extend = require('object-extend');

var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');
var theme = require('lucify-commons/src/js/lucify-theme.jsx');;
var d3 = require('d3');

var RefugeesBarChart = React.createClass({


  getData: function(){

    var baseData = {
      columns: [],
      types: {
          data1: 'bar',
      },
      labels: {
        show: true,
        format: function(v, id, i, j) {
            return sprintf("%.0f", v*10000);
        }
      }
    }

    if (!this.props.refugeeCountsModel) {
      return baseData;
    }

    var data = this.getEuroFigures().map(item => {
      var counts = this.props.refugeeCountsModel.getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      var relative = totalCount / item.population;
      return relative;
    });

    var data = {
      columns: [['data1'].concat(data)],
      colors: {
        data1: theme.cyan
      }
    }

    return extend(baseData, data);
  },


  getEuroFigures: function() {
      return _.filter(this.props.countryFigures, item => {
        return item.continent == 'Europe' && this.props.mapModel.getFriendlyNameForCountry(item.country) != null;
      });
  },


  getCategories: function() {
      var friendlyNames = {};
      var ret = this.getEuroFigures().map(item => {
        return this.props.mapModel.getFriendlyNameForCountry(item.country)
      });
      return ret;
  },


  componentDidUpdate: function() {
    d3.select(this.getDOMNode())
      .selectAll('.c3-text')
      .style("font-size", "14px")
      .attr("dx", "2px")
      .attr("fill", "black");
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
          max: 0.07
        },
        rotated: true
      },

      legend: {
         show: false
      }
    }
  },


  render: function() {

    if (!this.props.mapModel) {
      return <div />;
    }

    var data = this.getData();
    var spec = this.getSpec();

    return <C3Chart data={data}
      spec={spec} aspectRatio={1.5} />
  }


});


module.exports = RefugeesBarChart;
