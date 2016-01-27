

var React = require('react');
var _ = require('underscore');

var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');;

var RefugeesBarChart = require('./refugees-bar-chart.jsx');


var RefugeesBarCharts = React.createClass({


  render: function() {

    return (
      <div className="refugees-bar-charts">
        <div className="lucify-container">
          <DividedCols
            first={
                <div>
                  <h3>Hakemuksia 10 000 asukasta kohden</h3>
                  <RefugeesBarChart {...this.props} type={'pop'} />
                </div>

            }
            second={
              <div>
                <h3>Hakemuksia yhteensä</h3>
                <RefugeesBarChart {...this.props} type={'abs'} />
              </div>

            } />
        </div>
      </div>
    );

  }


});


module.exports = RefugeesBarCharts;
