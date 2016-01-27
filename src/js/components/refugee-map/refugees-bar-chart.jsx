
var React = require('react');
var _ = require('underscore');
var sprintf = require('sprintf');
var extend = require('object-extend');

var C3Chart = require('lucify-commons/src/js/components/react-c3/c3-chart.jsx');
var theme = require('lucify-commons/src/js/lucify-theme.jsx');;
var d3 = require('d3');

var refugeeConstants = require('../../model/refugee-constants.js');

var RefugeesBarChart = React.createClass({


  getData: function(){

    var baseData = {
      columns: [],
      types: {
          data1: 'bar',
      },
      labels: {
        show: true,
        format: this.getFormatter()
      }
    }

    if (!this.props.refugeeCountsModel) {
      return baseData;
    }

    var data = this.getEuroFigures().map(item => {
      var counts = this.props.refugeeCountsModel
        .getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      if (this.props.type == 'pop') {
          return totalCount / item.population;
      }
      if (this.props.type == 'abs') {
        return totalCount;
      }
    });

    var data = {
      columns: [['data1'].concat(data)],
      colors: {
        data1: theme.cyan
      }
    }

    return extend(baseData, data);
  },


  getFormatter: function() {
    if (this.props.type == 'pop') {
        return function(v, id, i, j) {
            return sprintf("%.0f", v*10000);
        };
    }
    if (this.props.type == 'abs') {
        return function(v, id, i, j) {
            return sprintf("%.1fk", v/1000);
        };
    }
  },


  getEuroFigures: function() {
      return _.filter(this.props.countryFigures, item => {
        if (item.continent != 'Europe'
          || !this.props.mapModel.getFriendlyNameForCountry(item.country)) {
          return false;
        }
        var counts = this.props.refugeeCountsModel
          .getTotalDestinationCounts(item.country, refugeeConstants.fullRange);
        var totalCount = counts.asylumApplications;
        if (totalCount < 5000) {
            // todo: add this to some "others"
            // category
            return false;
        }
        return true;
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



  getMax: function() {
    if (this.props.type == 'abs') {
      return null;
    } else if (this.props.type == 'pop') {
      return 0.07;
    }
    return null;
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
      spec={spec} aspectRatio={1.0} />
  }


});


module.exports = RefugeesBarChart;
