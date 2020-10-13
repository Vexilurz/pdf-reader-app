import './pdf.scss';
import React from 'react';
import * as DOM from 'react-dom';
import { Document, Page } from 'react-pdf';

interface ISinglePagePDFViewerProps {
  pdf: string;
  parentWidth: number;
}

interface ISinglePagePDFViewerState {
  numPages: number;
  pageNumber: number;
  scale: number;
  page?: any;
  searchText?: string;
}

export default class SinglePagePDFViewer extends React.Component<
  ISinglePagePDFViewerProps,
  ISinglePagePDFViewerState
> {
  constructor(props) {
    super(props);
    this.state = { numPages: 0, pageNumber: 1, scale: 1.0 };
  }

  componentDidMount() {}

  highlightPattern = (text, pattern) => {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const matches = text.match(pattern);

    return splitText.reduce(
      (arr, element, index) =>
        matches[index]
          ? [...arr, element, <mark key={index}>{matches[index]}</mark>]
          : [...arr, element],
      []
    );
  };

  makeTextRenderer = (searchText) => {
    return (textItem) => {
      return this.highlightPattern(textItem.str, searchText);
    };
  };

  onChange = (event) => {
    this.setState({ searchText: event.target.value });
  };

  // componentWillReceiveProps(nextProps) {
  //   if (Math.abs(nextProps.parentWidth - this.props.parentWidth) >= 2) {
  //     if (this.state.page) this.calcScale(this.state.page);
  //   }
  // }

  onPageLoad = (page) => {
    this.setState({ page });
    this.removeTextLayerOffset();
    this.calcScale(page);
  };

  calcScale = (page) => {
    const pageScale = this.props.parentWidth / page.originalWidth;
    if (this.state.scale !== pageScale) {
      this.setState({ scale: pageScale });
    }
  };

  removeTextLayerOffset = () => {
    const textLayers = document.querySelectorAll(
      '.react-pdf__Page__textContent'
    );
    textLayers.forEach((layer) => {
      const { style } = layer;
      style.top = '0';
      style.left = '0';
      style.transform = '';
    });
  };

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
    this.setState({ pageNumber: 1 });
  };

  changePage = (offset) => {
    const { pageNumber } = this.state;
    this.setState({ pageNumber: pageNumber + offset });
  };

  previousPage = () => {
    this.changePage(-1);
  };

  nextPage = () => {
    this.changePage(1);
  };

  render = (): React.ReactElement => {
    const { pdf } = this.props;
    const { pageNumber, numPages, scale, searchText } = this.state;
    return (
      <div>
        <div>
          <label htmlFor="search">Search:</label>
          <input
            type="search"
            id="search"
            value={searchText}
            onChange={this.onChange}
          />
        </div>
        <Document file={pdf} onLoadSuccess={this.onDocumentLoadSuccess}>
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={this.onPageLoad}
            // scale={scale}
            customTextRenderer={this.makeTextRenderer(searchText)}
          />
        </Document>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
          }}
        >
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            padding: '10px',
          }}
        >
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={this.previousPage}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={this.nextPage}
          >
            Next
          </button>
        </div>
      </div>
    );
  };
}
