import React from 'react';
import { PdfScaleControls } from './PdfScaleControls';
import { PdfSearchInput } from './PdfSearchInput';
import './pdfToolBar.scss';

export interface IPdfToolBarProps {
  pdfName: string;
  onSetPattern(searchPattern: string): void;
  onSetScale(scale: number): void;
}
export interface IPdfToolBarState {}

export class PdfToolBar extends React.Component<
  IPdfToolBarProps,
  IPdfToolBarState
> {
  componentDidMount() {}

  render(): React.ReactElement {
    const { pdfName, onSetPattern, onSetScale } = this.props;
    return (
      <div className="pdf-toolbar-container">
        <h4>{pdfName}</h4>
        <PdfSearchInput onSetPattern={onSetPattern} width={250} />
        <PdfScaleControls onSetScale={onSetScale} />
      </div>
    );
  }
}
