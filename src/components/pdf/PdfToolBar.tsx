import React from 'react';
import { PdfPageControl } from './PdfPageControl';
import { PdfScaleControls } from './PdfScaleControls';
import { PdfSearchInput } from './PdfSearchInput';
import './pdfToolBar.scss';

export interface IPdfToolBarProps {
  pdfName: string;
  onSetPattern(searchPattern: string): void;
  onSetScale(scale: number): void;
  onSetPageNumber(pageNumber: number): void;
  numPages: number;
  currentPage: number;
}
export interface IPdfToolBarState {}

export class PdfToolBar extends React.Component<
  IPdfToolBarProps,
  IPdfToolBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const {
      pdfName,
      onSetPattern,
      onSetScale,
      onSetPageNumber,
      numPages,
      currentPage,
    } = this.props;
    return (
      <div className="pdf-toolbar-container">
        <h4>{pdfName}</h4>
        <PdfSearchInput onSetPattern={onSetPattern} width={250} />
        <PdfPageControl
          width={200}
          onSetPageNumber={onSetPageNumber}
          numPages={numPages}
          currentPage={currentPage}
        />
        <PdfScaleControls onSetScale={onSetScale} />
      </div>
    );
  }
}
