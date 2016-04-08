
var React = require('react');
var Translate = require('react-translate-component');

var sprintf = require('sprintf');

var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');
var RefugeesBarChart = require('./refugees-bar-chart.jsx');


var PerPopulationBarChart = React.createClass({

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    staticScale: React.PropTypes.bool,
    locale: React.PropTypes.string
  },

  getValue: function(item) {
    var counts = this.props.refugeeCountsModel
      .getTotalDestinationCounts(item.country, this.props.timeRange);
    var totalCount = counts.asylumApplications;
    return totalCount / item.population;
  },

  format: function(v, _id, _i, _j) {
    return sprintf('%.0f', v * 100000);
  },

  getMax: function() {
    if (this.props.staticScale) {
      return 0.07;
    }
    return null;
  },

  render: function() {
    return (
      <RefugeesBarChart {...this.props}
        format={this.format}
        getValue={this.getValue}
        max={this.getMax()}
      />
    );
  }

});


var TotalsBarChart = React.createClass({

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    timeRange: React.PropTypes.arrayOf(React.PropTypes.number),
    staticScale: React.PropTypes.bool
  },

  getValue: function(item) {
    var counts = this.props.refugeeCountsModel
      .getTotalDestinationCounts(item.country, this.props.timeRange);
    var totalCount = counts.asylumApplications;
    return totalCount;
  },

  format: function(v, _id, _i, _j) {
    return sprintf('%.0fk', v / 1000);
  },

  getMax: function() {
    if (this.props.staticScale) {
      return 800*1000;
    }
    return null;
  },

  render: function() {
    return (
      <RefugeesBarChart {...this.props}
        format={this.format}
        getValue={this.getValue}
        max={this.getMax()}
      />
    );
  }

});



var RefugeesBarCharts = React.createClass({


  getInitialState: function() {
    return {
      staticScale: false
    };
  },


  handleCheckBoxChange: function() {
    this.setState({staticScale: !this.state.staticScale});
  },


  render: function() {
    return (
      <div className="refugees-bar-charts">
        <div className="lucify-container">

          <div className="refugees-bar-chart__fix-scale">
            <input type="checkbox" id="staticScale"
              onChange={this.handleCheckBoxChange}
              checked={this.state.staticScale}
            />
            <Translate component="label"
              htmlFor="staticScale"
              content="asylum_countries.constant_scale_time_changes"
            />
          </div>

          <DividedCols
            first={
              <div>
                <Translate component="h3" content="asylum_countries.applications_per_hundred_thousand" />
                <PerPopulationBarChart {...this.props}
                  staticScale={this.state.staticScale}
                />
              </div>
            }
            second={
              <div>
                <Translate component="h3" content="asylum_countries.total_applications" />
                <TotalsBarChart {...this.props}
                  staticScale={this.state.staticScale}
                />
              </div>
            }
          />
        </div>
      </div>
    );

  }


});


module.exports = RefugeesBarCharts;
