
import React from 'react';


export default function (Component) {
  class SelectionDecorator extends React.Component {

    constructor(props) {
      super(props);
      this.handleMouseOver = this.handleMouseOver.bind(this);
      this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }


    state = {
      selectedItem: null,
    };


    handleMouseOver(item) {
      this.setState({ selectedItem: item });
    }


    handleMouseLeave(item) {
      if (item == null) { // eslint-disable-line
                          // checks for both undefined or null
        this.setState({ selectedItem: null });
        return;
      }

      if (this.state.selectedItem === item) {
        // this prevents some annoying flickering
        window.setTimeout(() => {
          if (this.state.selectedItem === item) {
            this.setState({ selectedItem: null });
          }
        }, 100);
      }
    }


    render() {
      return (
        <Component
          {...this.props}
          onMouseOver={this.handleMouseOver}
          onMouseLeave={this.handleMouseLeave}
          selectedItem={this.state.selectedItem}
        />
      );
    }

  }

  SelectionDecorator.prototype.displayName = 'SelectionDecorator';

  return SelectionDecorator;
}
