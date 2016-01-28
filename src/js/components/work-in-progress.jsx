
var React = require('react');


var WorkInProgress = React.createClass({

  render: function() {
    return (
      <div className="work-in-progress">
        <div className="lucify-container">
        <p>Tämä on <b>työn alla oleva</b> <a href="http://www.lucify.com">Lucifyn</a> tuottama
        visualisaatio. Lucify laittaa verkkoon toisinaan keskeneräisiä visualisaatioita,
        jotta niitä saataisiin monipuolista palautetta. Koska kyse on keskeneräisestä
        versiosta, tässä saattaa olla virheitä ja teknisiä ongelmia. Ethän
        jaa linkkejä tälle sivulle ilman lupaa.</p>
        </div>
      </div>
    );

  }

});

module.exports = WorkInProgress;
