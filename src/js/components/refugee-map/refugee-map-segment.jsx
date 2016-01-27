
var React = require('react');
var sprintf = require('sprintf');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');
var FormRow = require('lucify-commons/src/js/components/nice-form-row.jsx');
var lucifyUtils = require('lucify-commons/src/js/lucify-utils.jsx');
var ComponentWidthMixin = require('lucify-commons/src/js/components/container-width-mixin.js');

var RefugeeMap = require('./responsive-refugee-map.jsx');
var TimeLayer = require('./refugee-map-time-layer.jsx');
var refugeeConstants = require('../../model/refugee-constants.js');


var RefugeeMapSegment = React.createClass({


  mixins: [ComponentWidthMixin],


  interactionsEnabled: function() {
    return !lucifyUtils.isSlowDevice();
  },


  getCountsInstruction: function() {
    if (refugeeConstants.labelShowBreakPoint < this.componentWidth) {
      return (
        <span>
          The counts shown on hover represent the number
          of people who have left or arrived in a country
          since 2012.
        </span>
      );
    }
    return null;
  },


  getInteractionsInstruction: function() {
    if (this.interactionsEnabled()) {
      return (
        <div>
          <p className="first">
            Hover over countries to
            show details. Click on a country to
            lock the selection.
            {' '}{this.getCountsInstruction()}
          </p>

          <p className="last">
            The line chart displays the total rate of
            asylum seekers over time. Hover over the
            chart to move the map in time.
          </p>
        </div>
      );
    } else {
      return (
        <p className="first last">
          The line chart displays the total rate of
          asylum seekers over time. Hover over the
          chart to move the map in time.
        </p>
      );
    }
  },


  render: function() {
    return (
      <div className="refugee-map-segment">
        <Inputs>
          <div className="lucify-container">
            <DividedCols
              first={
                <div className="inputs__instructions">
                </div>
              }
              second={
                <div className="inputs__instructions">
                  {this.getInteractionsInstruction()}
                </div>
              } />
          </div>
        </Inputs>

        <TimeLayer
          ref="time"
          onMouseOver={this.props.handleStampChange}
          stamp={this.props.stamp}
          refugeeCountsModel={this.props.refugeeCountsModel}
          mapModel={this.props.mapModel} />

        <RefugeeMap ref="rmap"
          {...this.props}
          interactionsEnabled={this.interactionsEnabled()} />
      </div>
    );
  }

});



module.exports = RefugeeMapSegment;
