
var React = require('react');
var _ = require('underscore');
var sprintf = require('sprintf');

var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');;
var RefugeesBarChart = require('./refugees-bar-chart.jsx');

var utils = require('../../utils.js');


var PerPopulationBarChart = React.createClass({

  getValue: function(item) {
      var counts = this.props.refugeeCountsModel
        .getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      return totalCount / item.population;
  },

  format: function(v, id, i, j) {
      return sprintf("%.0f", v*10000);
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
        max={this.getMax()} />
    )
  }

});


var TotalsBarChart = React.createClass({

  getValue: function(item) {
      var counts = this.props.refugeeCountsModel
        .getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      return totalCount;
  },

  format: function(v, id, i, j) {
      return sprintf("%.0fk", v/1000);
  },

  getMax: function() {
    if (this.props.staticScale) {
      return 200000;
    }
    return null;
  },

  render: function() {
    return (
      <RefugeesBarChart {...this.props}
        format={this.format}
        getValue={this.getValue}
        max={this.getMax()} />
    )
  }

});


var TotalsMonthlyAverageBarChart = React.createClass({

  getValue: function(item) {
      var counts = this.props.refugeeCountsModel
        .getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      return totalCount / utils.timeRangeInMonths(this.props.timeRange);
  },

  format: function(v, id, i, j) {
      return sprintf("%.0f", v);
  },

  getMax: function() {
    if (this.props.staticScale) {
      return 200000;
    }
    return null;
  },

  render: function() {
    return (
      <RefugeesBarChart {...this.props}
        format={this.format}
        getValue={this.getValue}
        max={this.getMax()} />
    )
  }

});


var PerPopulationMonthlyAverageBarChart = React.createClass({

  getValue: function(item) {
      var counts = this.props.refugeeCountsModel
        .getTotalDestinationCounts(item.country, this.props.timeRange);
      var totalCount = counts.asylumApplications;
      return totalCount / item.population / utils.timeRangeInMonths(this.props.timeRange);
  },

  format: function(v, id, i, j) {
      return sprintf("%.0f", v*100000);
  },

  getMax: function() {
    if (this.props.staticScale) {
      return 0.007;
    }
    return null;
  },

  render: function() {
    return (
      <RefugeesBarChart {...this.props}
        format={this.format}
        getValue={this.getValue}
        max={this.getMax()} />
    )
  }

});


var RefugeesBarCharts = React.createClass({


  getInitialState: function() {
    return {
      staticScale: true
    }
  },


  handleCheckBoxChange: function() {
      this.setState({staticScale: !this.state.staticScale});
  },


  render: function() {
    return (
      <div className="refugees-bar-charts">
        <div className="lucify-container">

          <input type="checkbox" id="staticScale"
            onChange={this.handleCheckBoxChange}
            checked={this.state.staticScale} />
            <label htmlFor="staticScale">
              Pidä skaala ajan muuttuessa vakiona
            </label>

          <DividedCols
            first={
                <div>
                  <h3>Hakemuksia 10 000 asukasta kohden</h3>
                  <PerPopulationBarChart {...this.props}
                  staticScale={this.state.staticScale} />
                </div>

            }
            second={
              <div>
                <h3>Hakemuksia yhteensä</h3>
                <TotalsBarChart {...this.props}
                  staticScale={this.state.staticScale} />
              </div>
            } />

          <DividedCols
            first={
                <div>
                  <h3>Hakemuksia 100 000 asukasta kohden keskimäärin per kuukausi</h3>
                  <PerPopulationMonthlyAverageBarChart {...this.props}
                  staticScale={this.state.staticScale} />
                </div>

            }
            second={
              <div>
                <h3>Hakemuksia yhteensä keskimäärin per kuukausi</h3>
                <TotalsMonthlyAverageBarChart {...this.props}
                  staticScale={this.state.staticScale} />
              </div>
            } />

        </div>
      </div>
    );

  }


});


module.exports = RefugeesBarCharts;
