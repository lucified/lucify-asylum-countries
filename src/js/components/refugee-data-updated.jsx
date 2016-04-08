var React = require('react');
var Translate = require('react-translate-component');

var LucifyUtils = require('../utils.js');
var d3 = require('d3');

var RefugeeDataUpdated = React.createClass({

  shouldComponentUpdate: function() {
    return false;
  },


  propTypes: {
    updatedAt: React.PropTypes.object.isRequired,
    locale: React.PropTypes.string
  },


  getFormatter: function(format) {
    if (this.props.locale === 'fi') {
      return LucifyUtils.d3FiLocale.timeFormat(format);
    }

    return d3.time.format(format);
  },


  render: function() {
    return (
      <div className="refugee-updated-at">
        <Translate content="asylum_countries.data_updated" />
        <br />
        {this.getFormatter('%e %B %Y')(this.props.updatedAt.toDate())}
      </div>
      );
  }

});


module.exports = RefugeeDataUpdated;
