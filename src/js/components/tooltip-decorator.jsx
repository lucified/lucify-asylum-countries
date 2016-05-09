
import React from 'react';
import selectionDecorator from './selection-decorator.jsx';

export default function tootlipDecoratorFunction(Component, ToolTipComponent) {
  class ToolTipDecorator extends React.Component {

    static propTypes = {
      onMouseLeave: React.PropTypes.func.isRequired,
      width: React.PropTypes.number,
      selectedItem: React.PropTypes.any,
    }


    constructor(props) {
      super(props);
      this.handleMouseMove = this.handleMouseMove.bind(this);
    }


    state = {
      mousePosition: null,
    }


    componentDidMount() {
      this.onScroll = () => { this.props.onMouseLeave(null); };
      this.scrollListener = window.addEventListener('scroll', this.onScroll, false);
    }


    componentWillUnmount() {
      window.removeEventListener('scroll', this.onScroll, false);
    }


    getToolTip() {
      const item = this.props.selectedItem;

      if (!item) {
        return null;
      }

      const style = {};
      if (this.state.mousePosition) {
        const offset = 8;
        const mouseX = this.state.mousePosition.x;
        const mouseY = this.state.mousePosition.y;

        const windowWidth = document.documentElement.clientWidth;
        const windowHeight = document.documentElement.clientHeight;

        if (mouseX < windowWidth / 2) {
          style.left = mouseX + offset;
        } else {
          style.right = (windowWidth - mouseX) + offset;
        }

        if (mouseY < windowHeight / 2) {
          style.top = mouseY + offset;
        } else {
          style.bottom = (windowHeight - mouseY) + offset;
        }
      }

      return (
        <div className="tooltip" style={style}>
          <ToolTipComponent item={item} maxWidth={this.props.width} />
        </div>
      );
    }


    handleMouseMove(event) {
      this.setState({
        mousePosition: {
          x: event.clientX,
          y: event.clientY,
        },
      });
    }


    render() {
      return (
        <div onMouseMove={this.handleMouseMove}>
          {this.getToolTip()}
          <div>
            <Component {...this.props} />
          </div>
        </div>
      );
    }
  }

  ToolTipDecorator.prototype.displayName = 'ToolTipDecorator';

  return selectionDecorator(ToolTipDecorator);
}
