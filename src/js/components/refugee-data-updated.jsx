var React = require('react');
var LucifyUtils = require('../utils.js');

var RefugeeDataUpdated = React.createClass({

  shouldComponentUpdate: function() {
    return false;
  },


  propTypes: {
    updatedAt: React.PropTypes.object.isRequired
  },


  render: function() {
    return (
      <div className="refugee-updated-at">
        Data päivitetty<br />
        {LucifyUtils.d3FiLocale.timeFormat('%e %B %Y')(this.props.updatedAt.toDate())}
      </div>
      );
  }

});


module.exports = RefugeeDataUpdated;
