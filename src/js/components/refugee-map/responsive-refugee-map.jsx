
var React = require('react');
var RefugeeMap = require('./refugee-map.jsx');

var ComponentWidthMixin = require('lucify-commons/src/js/components/container-width-mixin.js');


var ResponsiveRefugeeMap = React.createClass({

  mixins: [ComponentWidthMixin],


  getWidth: function() {
    return this.state.componentWidth;
  },


  getHeight: function() {
    return this.state.componentWidth;
  },

  updateForTimeRange: function(timeRange) {
    this.refs.rmap.updateForTimeRange(timeRange);
  },

  render: function() {
    return (
      <div>
        <RefugeeMap ref="rmap" {...this.props}
          width={this.getWidth()}
          height={this.getHeight()} />
      </div>
    );
  }

});

module.exports = ResponsiveRefugeeMap;
