
var React = require('react');
var Translate = require('react-translate-component');

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
                <Translate component="p"
                  className="first"
                  content="asylum_countries.project_background"
                  unsafe // allows content to include HTML
                />
                <Translate component="p"
                  className="last"
                  content="asylum_countries.project_author"
                  unsafe
                />
              </div>
            }
            second={
              <div className="inputs__instructions">
                <Translate component="p"
                  className="first last"
                  content="asylum_countries.project_goal"
                />
              </div>
            }
          />
        </div>
      </Inputs>
    );
  }
});

module.exports = Footer;
