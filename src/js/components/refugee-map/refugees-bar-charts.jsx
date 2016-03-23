
var React = require('react');
var sprintf = require('sprintf');

var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');
var RefugeesBarChart = require('./refugees-bar-chart.jsx');


var PerPopulationBarChart = React.createClass({

  getValue: function(item) {
    var counts = this.props.refugeeCountsModel
      .getTotalDestinationCounts(item.country, this.props.timeRange);
    var totalCount = counts.asylumApplications;
    return totalCount / item.population;
  },

  format: function(v, _id, _i, _j) {
    return sprintf('%.0f', v*100000);
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
    return sprintf('%.0fk', v/1000);
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
        max={this.getMax()} />
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
              checked={this.state.staticScale} />
              <label htmlFor="staticScale">
                Pidä skaala ajan muuttuessa vakiona
              </label>
          </div>

          <DividedCols
            first={
              <div>
                <h3>Hakemuksia 100 000 asukasta kohden</h3>
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

        </div>
      </div>
    );

  }


});


module.exports = RefugeesBarCharts;
