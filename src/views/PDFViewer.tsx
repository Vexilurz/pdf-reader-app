import * as React from 'react';
//https://www.pdftron.com/blog/react/how-to-build-a-react-pdf-viewer/
export interface IPDFViewerProps {}

export default class PDFViewer extends React.Component<IPDFViewerProps> {
  constructor(props) {
    super(props);
    this.viewerRef = React.createRef();
    this.backend = new props.backend();
  }

  componentDidMount() {
    const { src } = this.props;
    const element = this.viewerRef.current;

    this.backend.init(src, element);
  }

  render() {
    return (
      <div
        ref={this.viewerRef}
        id="pdf-viewer"
        style={{ width: '100%', height: '100%' }}
      ></div>
    );
  }
}
