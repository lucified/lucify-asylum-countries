
var React = require('react');
var sprintf = require('sprintf');
var moment = require('moment');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var RefugeeSmallMultiples = require('./refugee-small-multiples.jsx');
var Tabs = require('react-simpletabs');


var RefugeeMultiplesSegment = React.createClass({


  getInitialState: function(){
    return {
      relativeToPopulation: false
    }
  },


 handleCheckBoxChange: function() {
    this.setState({relativeToPopulation: !this.state.relativeToPopulation});
  },


  render: function() {
    return (
      <div className="refugee-multiples-segment">
          <Inputs>
          <div className="lucify-container">
            <DividedCols
              first={
                <div className="inputs__instructions">
                  <p className="first last">
                    Seuraavat kuvaajat esittävät
                    turvapaikanhakijoiden määriä ajan funktiona
                    maittain.
                  </p>
                </div>
              }
              second={
                <div className="inputs__instructions">
                   <input type="checkbox" id="staticScale"
                    onChange={this.handleCheckBoxChange}
                    checked={this.state.relativeToPopulation} />
                    <label htmlFor="staticScale">
                      Suhteuta maiden väkilukuihin
                    </label>
                </div>
              } />
          </div>
        </Inputs>

        <div className="lucify-container">
            <RefugeeSmallMultiples {...this.props}
              relativeToPopulation={this.state.relativeToPopulation} />
        </div>
      </div>


    );
  }

});



module.exports = RefugeeMultiplesSegment;
