
var React = require('react');
var Translate = require('react-translate-component');
var d3 = require('d3');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var RefugeeSmallMultiples = require('./refugee-small-multiples.jsx');

var LucifyUtils = require('../../utils.js');


var RefugeeMultiplesSegment = React.createClass({

  propTypes: {
    locale: React.PropTypes.string
  },

  getInitialState: function(){
    return {
      relativeToPopulation: false
    };
  },


  handleCheckBoxChange: function() {
    this.setState({relativeToPopulation: !this.state.relativeToPopulation});
  },


  getPopulationDivider: function() {
    return 100000;
  },


  getFriendlyPopulationDivider: function() {
    var formatter = (this.props.locale === 'fi') ?
      LucifyUtils.d3FiLocale.numberFormat : d3.format;

    // "," means enable thousands separator
    return formatter(',')(this.getPopulationDivider());
  },


  getInstructionsText: function() {
    if (this.state.relativeToPopulation) {
      return (
        <Translate component="p"
          className="first last"
          content="asylum_countries.monthly_applications_proportional"
          count={this.getFriendlyPopulationDivider()}
        />
      );
    } else {
      return (
        <Translate component="p"
          className="first last"
          content="asylum_countries.monthly_applications"
        />
      );
    }
  },


  render: function() {
    return (
      <div className="refugee-multiples-segment">
        <Inputs>
          <div className="lucify-container">
            <DividedCols
              first={
                <div className="inputs__instructions">
                  {this.getInstructionsText()}
                </div>
              }
              second={
                <div className="inputs__instructions">
                  <input type="checkbox" id="staticScale"
                    onChange={this.handleCheckBoxChange}
                    checked={this.state.relativeToPopulation}
                  />
                  <Translate component="label"
                    htmlFor="staticScale"
                    content="asylum_countries.proportional_to_country_population"
                  />
                </div>
              }
            />
          </div>
        </Inputs>

        <div className="lucify-container">
          <RefugeeSmallMultiples {...this.props}
            relativeToPopulation={this.state.relativeToPopulation}
            populationDivider={this.getPopulationDivider()}
          />
        </div>
      </div>


    );
  }

});


module.exports = RefugeeMultiplesSegment;
