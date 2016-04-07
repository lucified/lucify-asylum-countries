
var React = require('react');
var d3 = require('d3');
var moment = require('moment');

var LineChart = require('lucify-small-line-chart').default;
var dataTools = require('lucify-data-tools');
var ResponsiveDecorator = require('lucify-commons/src/js/decorators/responsive-decorator.jsx');
var ResponsiveLineChart = ResponsiveDecorator(LineChart);


var RefugeeSmallMultiplees = React.createClass({

  getInitialState: function() {
    return {
      selectedX: null
    };
  },


  handleSelectedChange: function(x) {
    this.setState({selectedX: x});
  },

  propTypes: {
    refugeeCountsModel: React.PropTypes.object,
    mapModel: React.PropTypes.object,
    relativeToPopulation: React.PropTypes.bool,
    countryFigures: React.PropTypes.object,
    populationDivider: React.PropTypes.number
  },

  getSourceData: function() {
    var data = this.props.refugeeCountsModel
      .getEuroFigures(this.props.countryFigures, 25);
    return data.map(item => {
      return {
        country: item.country,
        values: this.props.refugeeCountsModel.getGlobalArrivingPerMonthForCountry(item.country)
      };
    });
  },


  componentWillReceiveProps: function(nextProps) {
    if (this.props.relativeToPopulation !== nextProps.relativeToPopulation
      || this.props.populationDivider !== nextProps.populationDivider) {
      this._data = null;
      this._maxY = null;
    }
  },


  getMaxY: function() {
    if (!this._maxY) {
      this._maxY = this._getMaxY();
    }
    return this._maxY;
  },

  _getMaxY: function() {
    return d3.max(this.getData().filter(item => item.country !== 'SRB'),
      item => d3.max(item.chartData, vitem => vitem[1]));
  },


  getData: function() {
    if (!this._data) {
      this._data = this._getData();
    }
    return this._data;
  },

  _getData: function() {
    var data = this.getSourceData();
    data.forEach(countryItem => {
      countryItem.chartData = countryItem.values.map(valueItem => {
        var asylumApplications = valueItem.asylumApplications;
        if (this.props.relativeToPopulation) {
          asylumApplications =
            Math.round(valueItem.asylumApplications /
              this.props.countryFigures[countryItem.country].population *
              this.props.populationDivider);
        }
        return [dataTools.dateToMonthIndex(valueItem.date), asylumApplications];
      });
    });
    return data;
  },


  xTickFormat: function(value) {
    var mom = moment(dataTools.monthIndexToDate(value));
    return mom.format('YYYY');
  },


  xFormat: function(value) {
    var mom = moment(dataTools.monthIndexToDate(value));
    return mom.format('MM/YYYY');
  },


  getLineCharts: function() {
    return this.getData().map(item => {
      return (
        <div key={item.country}
          className="refugee-small-multiples__item col-xs-6 col-sm-4 col-md-3 col-lg-2">
          <ResponsiveLineChart
            xTickFormat={this.xTickFormat}
            xFormat={this.xFormat}
            minY={0}
            maxY={this.getMaxY()}
            onSelectedChange={this.handleSelectedChange}
            data={item.chartData}
            selectedX={this.state.selectedX}
            aspectRatio={0.8} />
          <div className="refugee-small-multiples__item-title">
            {this.props.mapModel.getFriendlyNameForCountry(item.country)}
          </div>
        </div>
      );
    });
  },


  render: function() {
    return (
      <div className="small-multiples row">
        {this.getLineCharts()}
      </div>
    );
  }


});


module.exports = RefugeeSmallMultiplees;
