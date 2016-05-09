
var React = require('react');
var moment = require('moment');
var Translate = require('react-translate-component');
var translate = require('counterpart');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');
var ComponentWidthMixin = require('lucify-commons/src/js/components/container-width-mixin.js');

var RefugeeMap = require('./responsive-refugee-map.jsx');
var TimeLayer = require('./refugee-map-time-layer.jsx');
var RefugeeTimeRangeIndicator = require('./refugee-time-range-indicator.jsx');

var RefugeesBarCharts = require('./refugees-bar-charts.jsx');
var RefugeeHighlightMixin = require('./refugee-highlight-mixin.js');
var RefugeeConstants = require('../../model/refugee-constants.js');

var Tabs = require('react-simpletabs');


var RefugeeMapSegment = React.createClass({


  mixins: [ComponentWidthMixin, RefugeeHighlightMixin],


  getInitialState: function() {
    return {
      timeRange: [
        moment([2015, 0]).startOf('month').unix(),
        moment([2015, 11]).endOf('month').unix()
      ],
      showTimeRange: true
    };
  },


  getTimeRange: function() {
    return this.state.timeRange;
  },


  handleTimeRangeChange: function(newTimeRange) {
    this.setState({timeRange: newTimeRange});
  },



  interactionsEnabled: function() {
    return true;
  },


  getInstructions: function() {
    if (this.componentWidth < RefugeeConstants.labelShowBreakPoint) {
      return (
        <Inputs>
          <div className="lucify-container">
            <DividedCols
              first={
                <div className="inputs__instructions">
                  <Translate component="p"
                    className="first"
                    content="asylum_countries.description"
                  />
                  <Translate component="p"
                    className="last"
                    content="asylum_countries.instructions_country_selection"
                  />
                </div>
              }
              second={
                <div className="inputs__instructions">
                  <p className="first last">
                    <Translate component="span"
                      content="asylum_countries.instructions_map_colors"
                    />
                    {' '}
                    <Translate component="span"
                      content="asylum_countries.instructions_time_selection"
                    />
                  </p>
                </div>
              } />
          </div>
        </Inputs>
      );
    }

    return (
      <Inputs>
        <div className="lucify-container">
          <DividedCols
            first={
              <div className="inputs__instructions">
                <Translate component="p"
                  className="first"
                  content="asylum_countries.description"
                />
                <p className="last">
                  <Translate component="span"
                    content="asylum_countries.instructions_map_colors"
                  />
                  {' '}
                  <Translate component="span"
                    content="asylum_countries.instructions_time_selection"
                  />
                </p>
              </div>
            }
            second={
              <div className="inputs__instructions">
                <Translate component="p"
                  className="first"
                  content="asylum_countries.instructions_country_selection"
                />
                <Translate component="p"
                  className="last"
                  content="asylum_countries.instructions_numbers"
                />
              </div>
            } />
        </div>
      </Inputs>
    );
  },


  render: function() {
    return (
      <div className="refugee-map-segment">
        {this.getInstructions()}

        <TimeLayer
          country={this.getHighlightedCountry()}
          ref="time"
          width={this.componentWidth}
          onTimeRangeChange={this.handleTimeRangeChange}
          timeRange={this.state.timeRange}
          refugeeCountsModel={this.props.refugeeCountsModel}
          countryFigures={this.props.countryFigures}
          mapModel={this.props.mapModel}
          locale={this.props.locale}
        />

        <div className="refugee-map-segment__tabs">
          <Tabs>
            <Tabs.Panel title={translate('asylum_countries.map_of_europe')}>
              <RefugeeMap ref="rmap"
                {...this.props}
                {...this.getHighlightLayerParams()}
                onMouseOver={this.handleMouseOver}
                onMouseLeave={this.handleMouseLeave}
                onMapClick={this.handleMapClick}
                lo={22.2206322 - 9}
                la={34.0485818 + 18.5}
                scale={1.706}
                preferredHeightWidthRatio={0.82}
                timeRange={this.state.timeRange}
                interactionsEnabled={this.interactionsEnabled()}
              />
            </Tabs.Panel>

            <Tabs.Panel title={translate('asylum_countries.map_of_europe_and_origin_countries')}>
              <RefugeeMap ref="rmap"
                {...this.props}
                {...this.getHighlightLayerParams()}
                onMouseOver={this.handleMouseOver}
                onMouseLeave={this.handleMouseLeave}
                onMapClick={this.handleMapClick}
                timeRange={this.state.timeRange}
                interactionsEnabled={this.interactionsEnabled()}
              />
            </Tabs.Panel>

            <Tabs.Panel title={translate('asylum_countries.bar_charts')}>
              <RefugeesBarCharts
                {...this.props}
                timeRange={this.state.timeRange}
              />
            </Tabs.Panel>
          </Tabs>
          <RefugeeTimeRangeIndicator
            timeRange={this.state.timeRange}
            locale={this.props.locale}
          />
        </div>

      </div>
    );
  }

});



module.exports = RefugeeMapSegment;
