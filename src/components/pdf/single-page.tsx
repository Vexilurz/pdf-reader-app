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
  parentDiv?: any;
  searchText?: string;
  setPages?: Object;
  start: number;
  end: number;
}

const splitTriple = (start, end) => (x) => [
  x.slice(0, start),
  x.slice(start, end),
  x.slice(end),
];

const splitDuo = (due) => (x) => [x.slice(0, due), x.slice(due)];

let count_init = 0;

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
      start: Infinity,
      end: Infinity,
    };

    this.containerRef = React.createRef();
    this.documentRef = React.createRef();
  }

  getItemOffset = async (pageNumber: number, itemIndex = Infinity) => {
    const page = await this.documentRef.current.getPage(pageNumber);
    const textContent = await page.getTextContent();
    console.log('getItemOffset', itemIndex, textContent);

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
    // console.log('getTotalOffset', container, offset);
    const textLayerItem = container.parentNode;
    // console.log('textLayerItem', textLayerItem);
    const textLayer = textLayerItem.parentNode;
    // console.log('textLayer', textLayer);

    const page = textLayer.parentNode;
    // console.log('page', page);

    const pageNumber = parseInt(page.dataset.pageNumber, 10);
    // console.log('pageNumber', pageNumber);
    const itemIndex = this.getItemIndex(textLayerItem);
    // console.log('itemIndex', itemIndex);

    const [pageOffset, itemOffset] = await Promise.all([
      this.getPageOffset(pageNumber),
      this.getItemOffset(pageNumber, itemIndex),
    ]);
    console.log(
      'pageOffset',
      pageOffset,
      'itemOffset',
      itemOffset,
      'return',
      pageOffset + itemOffset + offset
    );

    count_init = pageOffset;

    return pageOffset + itemOffset + offset;
  };

  componentDidMount() {
    const parent = DOM.findDOMNode(this).parentNode;
    this.setState({ parentDiv: parent });
  }

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

    // console.log(tmp);
    return tmp;
  };

  getMarkedText = (text, key) => {
    return (
      <mark key={key} style={{ backgroundColor: 'black' }}>
        {text}
      </mark>
    );
  };

  newPattern = (text, start, end, counter) => {
    console.log(counter, start, end, text);
    let result = text;
    let dbg = 'unmarked:';
    if (counter >= start && counter + text.length <= end) {
      // mark all text
      dbg = 'mark all text:';
      result = this.getMarkedText(text, counter);
    } else if (counter >= start && counter < end) {
      // mark left part
      dbg = 'mark left part:';
      result = splitDuo(end - counter)(text);
      result[0] = this.getMarkedText(result[0], counter);
    } else if (counter + text.length > start && counter + text.length <= end) {
      // mark right part
      dbg = 'mark right part:';
      result = splitDuo(start - counter)(text);
      result[1] = this.getMarkedText(result[1], counter);
    } else if (counter < start && counter + text.length > end) {
      // mark middle
      dbg = 'mark middle:';
      result = splitTriple(start - counter, end - counter)(text);
      result[1] = this.getMarkedText(result[1], counter);
    }
    console.log(dbg, result);
    return result;
  };

  makeNewTextRenderer = (start, end) => {
    // console.log('makeNewTextRenderer', start, end);
    let counter = count_init;
    return (textItem) => {
      let pattern = '';
      if (textItem.str) {
        pattern = this.newPattern(textItem.str, start, end, counter);
        counter += textItem.str.length;
      }
      return pattern;
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

  calcScale = (page) => {
    if (this.state.parentDiv) {
      const pageScale = this.state.parentDiv.clientWidth / page.originalWidth;
      if (this.state.scale !== pageScale) {
        this.setState({ scale: pageScale });
      }
    }
  };

  onPageLoad = async (page) => {
    this.removeTextLayerOffset();
    this.calcScale(page);

    const textContent = await page.getTextContent();

    // console.log('textContent', textContent);

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

  onMouseUp = async () => {
    if (this.containerRef.current === null || this.documentRef.current === null)
      return;

    const selection = window.getSelection();

    if (selection?.toString() === '') return;

    const rangeAt0 = selection.getRangeAt(0);
    console.log('selection.getRangeAt(0)', rangeAt0);
    selection?.empty(); // important!

    const {
      commonAncestorContainer,
      endContainer,
      endOffset,
      startContainer,
      startOffset,
    } = rangeAt0;

    // Selection partially outside PDF document
    if (!this.containerRef.current.contains(commonAncestorContainer)) return;

    const [startTotalOffset, endTotalOffset] = await Promise.all([
      this.getTotalOffset(startContainer, startOffset),
      this.getTotalOffset(endContainer, endOffset),
    ]);

    console.log(`Selected ${startTotalOffset} to ${endTotalOffset}`);
    this.setState({ start: startTotalOffset, end: endTotalOffset });
  };

  onMouseDown = async () => {
    this.setState({ start: Infinity, end: Infinity });
  };

  render = (): React.ReactElement => {
    const { pdf } = this.props;
    const { pageNumber, numPages, searchText, scale, start, end } = this.state;
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
        <div>
          Start: {start}, End: {end}
        </div>
        <Document
          file={pdf}
          onLoadSuccess={this.onDocumentLoadSuccess}
          inputRef={(ref) => (this.containerRef.current = ref)}
          onMouseUp={this.onMouseUp}
          onMouseDown={this.onMouseDown}
        >
          <Page
            pageNumber={pageNumber}
            onLoadSuccess={this.onPageLoad}
            scale={scale}
            // renderTextLayer={false}
            // renderMode={'svg'}
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
