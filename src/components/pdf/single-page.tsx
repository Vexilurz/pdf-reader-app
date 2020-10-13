// @
/* eslint-disable */
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
  setPages?: Object;
  start: number;
  end: number;
}

const splitAt = (start, end) => (x) => [
  x.slice(0, start),
  x.slice(start, end),

  x.slice(end),
];

export default class SinglePagePDFViewer extends React.Component<
  ISinglePagePDFViewerProps,
  ISinglePagePDFViewerState
> {
  private containerRef: React.RefObject<any>;
  private documentRef: React.RefObject<any>;

  constructor(props: ISinglePagePDFViewerProps) {
    super(props);
    this.state = {
      numPages: 0,
      pageNumber: 1,
      scale: 1.0,
      setPages: {},
      start: 0,
      end: 0,
    };

    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
  }

  getItemOffset = async (pageNumber: number, itemIndex = Infinity) => {
    const page = await this.documentRef.current.getPage(pageNumber);
    const textContent = await page.getTextContent();

    return textContent.items
      .slice(0, itemIndex)
      .reduce((acc: number, item) => acc + item.str.length, 0);
  };

  // Calculates total length of all previous pages
  getPageOffset = async (pageNumber) => {
    const pageLengths = await Promise.all(
      Array.from({ length: pageNumber - 1 }, (_, index) =>
        this.getItemOffset(index + 1)
      )
    );

    return pageLengths.reduce((acc, pageLength) => acc + pageLength, 0);
  };

  getItemIndex = (item) => {
    let index = 0;

    while ((item = item.previousSibling) !== null) {
      index++;
    }

    return index;
  };

  getTotalOffset = async (container, offset) => {
    const textLayerItem = container.parentNode;
    const textLayer = textLayerItem.parentNode;
    const page = textLayer.parentNode;

    const pageNumber = parseInt(page.dataset.pageNumber, 10);
    const itemIndex = this.getItemIndex(textLayerItem);

    const [pageOffset, itemOffset] = await Promise.all([
      this.getPageOffset(pageNumber),
      this.getItemOffset(pageNumber, itemIndex),
    ]);

    return pageOffset + itemOffset + offset;
  };

  componentDidMount() {}

  highlightPattern = (text, pattern) => {
    const splitText = text.split(pattern);

    if (splitText.length <= 1) {
      return text;
    }

    const matches = text.match(pattern);

    const tmp = splitText.reduce(
      (arr, element, index) =>
        matches[index]
          ? [
              ...arr,
              element,
              <mark key={index} style={{ backgroundColor: 'black' }}>
                {matches[index]}
              </mark>,
            ]
          : [...arr, element],
      []
    );

    console.log(tmp);
    return tmp;
  };

  newPattern = (text, start, end, counter) => {
    counter -= text?.length;
    console.log(counter);
    if (start > counter + text.length) {
      return text;
    } else {
      const splitText = splitAt(start - counter, end - counter)(text);
      splitText[1] = (
        <mark key={counter} style={{ backgroundColor: 'black' }}>
          {splitText[1]}
        </mark>
      );

      return splitText;
    }
  };

  makeNewTextRenderer = (start, end) => {
    let counter = 0;
    return (textItem) => {
      counter += 1;
      if (textItem.str) {
        counter += textItem.str.length;
      }
      return this.newPattern(textItem.str, start, end, counter);
    };
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

  onPageLoad = async (page) => {
    this.setState({ page });
    this.removeTextLayerOffset();
    this.calcScale(page);

    const textContent = await page.getTextContent();

    console.log(textContent);

    /**
     * {
     *  page: 1
     *  startIndex: 1234
     *  len: 10
     *  label: "dasds"
     *  text: "asdasd"
     * }
     *
     */
  };
  //"Dynamic languages such as JavaScript are more difficult to com-"

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

  onDocumentLoadSuccess = (document) => {
    const { numPages } = document;

    this.setState({ numPages });
    this.setState({ pageNumber: 1 });

    this.documentRef.current = document;
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
    const { pageNumber, numPages, scale, searchText, start, end } = this.state;
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
        <Document
          file={pdf}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={(ref) => (this.containerRef.current = ref)}
          onMouseUp={async () => {
            if (
              this.containerRef.current === null ||
              this.documentRef.current === null
            ) {
              // Not loaded yet
              return;
            }

            const selection = window.getSelection();

            if (selection?.toString() === '') {
              // Selection is empty
              return;
            }

            const {
              commonAncestorContainer,
              endContainer,
              endOffset,
              startContainer,
              startOffset,
            } = selection.getRangeAt(0);

            if (!this.containerRef.current.contains(commonAncestorContainer)) {
              // Selection partially outside PDF document
              return;
            }

            const [startTotalOffset, endTotalOffset] = await Promise.all([
              this.getTotalOffset(startContainer, startOffset),
              this.getTotalOffset(endContainer, endOffset),
            ]);

            console.log(`Selected ${startTotalOffset} to ${endTotalOffset}`);
            this.setState({ start: startTotalOffset, end: endTotalOffset });
          }}
        >
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={this.onPageLoad}
            // scale={scale}
            customTextRenderer={this.makeNewTextRenderer(start, end)}
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
