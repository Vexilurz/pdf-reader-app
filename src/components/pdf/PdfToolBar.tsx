import './pdfToolBar.scss';
import {
  faPrint,
  faFolderOpen,
  faSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ipcRenderer } from 'electron';
import React from 'react';
import { Button } from 'react-bootstrap';
import { PdfPageControl } from './PdfPageControl';
import { PdfScaleControls } from './PdfScaleControls';
import { PdfSearchInput } from './PdfSearchInput';
import * as appConst from '../../types/textConstants';

export interface IPdfToolBarProps {
  pdfName: string;
  onSetPattern(searchPattern: string): void;
  prevSearchRes(): void;
  nextSearchRes(): void;
  currentSearchResNum: number;
  totalSearchResCount: number;
  onSetScale(scale: number): void;
  onSetPageNumber(pageNumber: number): void;
  numPages: number;
  currentPage: number;
  onPrint(): void;
  onAreaSelectionToggle(): void;
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
      prevSearchRes,
      nextSearchRes,
      currentSearchResNum,
      totalSearchResCount,
      onSetScale,
      onSetPageNumber,
      numPages,
      currentPage,
      onPrint,
      onAreaSelectionToggle,
    } = this.props;
    return (
      <div className="pdf-toolbar-container">
        <h4>{pdfName}</h4>
        <PdfSearchInput
          onSetPattern={onSetPattern}
          width={250}
          prevSearchRes={prevSearchRes}
          nextSearchRes={nextSearchRes}
          currentSearchResNum={currentSearchResNum}
          totalSearchResCount={totalSearchResCount}
        />
        <PdfPageControl
          width={170}
          onSetPageNumber={onSetPageNumber}
          numPages={numPages}
          currentPage={currentPage}
        />
        <PdfScaleControls onSetScale={onSetScale} />
        <Button variant="outline-secondary" onClick={onAreaSelectionToggle}>
          <FontAwesomeIcon icon={faSquare} />
        </Button>
        <Button
          variant="outline-secondary"
          onClick={() => {
            ipcRenderer.send(appConst.OPEN_EXTERNAL_PDF);
          }}
        >
          <FontAwesomeIcon icon={faFolderOpen} />
        </Button>
        <Button variant="outline-secondary" onClick={onPrint}>
          <FontAwesomeIcon icon={faPrint} />
        </Button>
      </div>
    );
  }
}
