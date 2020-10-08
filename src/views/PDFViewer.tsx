import * as React from 'react';

import * as pdfjsLib from 'pdfjs-dist';

const pdfPath = '/public/example.pdf';

export default class PDFViewer extends React.Component {
  componentDidMount() {
    // TODO FIX FAKE WORKER
    pdfjsLib.GlobalWorkerOptions.workerSrc = '../../pdf.worker.js';

    const loadingTask = pdfjsLib.getDocument(pdfPath);

    loadingTask.promise
      .then((pdfDocument) => {
        // Request a first page
        return pdfDocument.getPage(1).then(function (pdfPage) {
          // Display page on the existing canvas with 100% scale.
          const viewport = pdfPage.getViewport({ scale: 1.0 });
          const canvas = document.getElementById('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          const renderTask = pdfPage.render({
            canvasContext: ctx,
            viewport: viewport,
          });
          return renderTask.promise;
        });
      })
      .catch((reason) => {
        console.error('Error: ' + reason);
      });
  }

  render(): React.ReactElement {
    return <canvas id="canvas" />;
  }
}
