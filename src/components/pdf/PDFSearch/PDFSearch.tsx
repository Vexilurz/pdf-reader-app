import * as React from 'react';

export interface IPDFSearchProps {}
export interface IPDFSearchState {
  searchText: string;
}

export default class PDFSearch extends React.Component<
  IPDFSearchProps,
  IPDFSearchState
> {
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
    return tmp;
  };

  makeTextRenderer = (searchText) => {
    return (textItem) => {
      return this.highlightPattern(textItem.str, searchText);
    };
  };

  onChange = (event) => {
    this.setState({ searchText: event.target.value });
  };

  // <Page
  //   customTextRenderer={this.makeTextRenderer(searchText)}
  // />

  render(): React.ReactElement {
    const { searchText } = this.state;
    return (
      <div className="pdf-search">
        <label htmlFor="search">Search:</label>
        <input
          type="search"
          id="search"
          value={searchText}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
