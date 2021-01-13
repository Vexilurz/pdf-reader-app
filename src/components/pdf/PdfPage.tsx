import React, { Component } from 'react';

interface Props {}
interface State {}

export default class PdfPage extends Component<Props, State> {
  state = {};

  render() {
    return (
      <Measure bounds onResize={this.handlePdfPageResize(index)}>
        {({ measureRef }) => (
          <div ref={measureRef}>
            <Page
              scale={scale}
              pageNumber={index + 1}
              onLoadSuccess={this.onPageLoad}
              customTextRenderer={this.pdfRenderer(index + 1)}
              // renderTextLayer={renderTextLayer}
              onGetTextSuccess={() => {
                this.onRenderFinished(index + 1);
              }}
            />
          </div>
        )}
      </Measure>
    );
  }
}
