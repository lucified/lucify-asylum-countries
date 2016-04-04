
var React = require('react');

var Inputs = require('lucify-commons/src/js/components/inputs.jsx');
var DividedCols = require('lucify-commons/src/js/components/divided-cols.jsx');

var Footer = React.createClass({

  render: function() {
    return (
      <Inputs>
        <div className="lucify-container">
          <DividedCols
            first={
              <div className="inputs__instructions">
                <p className="first">
                  Tämä vuorovaikutteinen visualisaatio on luotu osana
                  valtioneuvoston vuoden 2015 selvitys- ja
                  tutkimussuunnitelman toimeenpanoon kuuluvan
                  Yhtäköyttä-hankkeen <b>Informaatiomuotoilija
                  talossa</b> -kokeilua.
                </p>
                <p className="last">
                  Visualisaation on laatinut Lucify Oy.
                </p>
              </div>
            }
            second={
              <div className="inputs__instructions">
                <p className="first last">
                  Hankkeessa selvitetään kokeilutoimintaa hyödyntäen,
                  millaisilla erilaisilla välineillä ja toimintatavoilla
                  voidaan tukea kokonaisvaltaista tiedolla johtamista ja
                  tutkimusaineistojen parempaa hyödyntämistä päätöksenteossa.
                </p>
              </div>
            }
          />
        </div>
      </Inputs>
    );
  }
});

module.exports = Footer;
