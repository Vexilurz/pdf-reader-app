import * as React from 'react';

export interface ITextItemProps {
  children: any;
  id: string;
}
export interface ITextItemState {
  color: string;
}

export class TextItem extends React.Component<ITextItemProps, ITextItemState> {
  constructor(props) {
    super(props);
    this.state = {
      color: 'white',
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.id === '1,0,0') this.setState({ color: 'red' });
    }, 5000);
  }

  render(): React.ReactElement {
    const { children, id } = this.props;
    return (
      <span id={id} style={{ backgroundColor: this.state.color }}>
        {children}
      </span>
    );
  }
}
