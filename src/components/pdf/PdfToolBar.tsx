import './pdfToolBar.scss';
import {
  faPrint,
  faFolderOpen,
  faVectorSquare,
  faCommentAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ipcRenderer } from 'electron';
import React from 'react';
import { Button } from 'react-bootstrap';
import { PdfPageControl } from './PdfPageControl';
import { PdfScaleControls } from './PdfScaleControls';
import { PdfSearchInput } from './PdfSearchInput';
import * as appConst from '../../types/textConstants';

export interface IProps {
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
  areaSelectionEnable: boolean;
  onAddBookmark(): void;
  onOpenPDFinExternal(): void;
}
export interface IState {}

export class PdfToolBar extends React.Component<IProps, IState> {
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
      areaSelectionEnable,
      onAddBookmark,
      onOpenPDFinExternal,
    } = this.props;
    const areaSelectionToggleStyle = areaSelectionEnable
      ? 'secondary'
      : 'outline-secondary';
    return (
      <div className="pdf-toolbar-main-container">
        <div>
          <h4>{pdfName}</h4>
        </div>
        <div className="pdf-toolbar-container">
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
          <Button
            variant={areaSelectionToggleStyle}
            onClick={onAreaSelectionToggle}
          >
            <FontAwesomeIcon icon={faVectorSquare} />
          </Button>
          <Button
            variant="outline-secondary"
            onClick={(e) => {
              onAddBookmark();
            }}
          >
            <FontAwesomeIcon icon={faCommentAlt} />
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => {
              // ipcRenderer.send(appConst.OPEN_EXTERNAL_PDF);
              onOpenPDFinExternal();
            }}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
          </Button>
          <Button variant="outline-secondary" onClick={onPrint}>
            <FontAwesomeIcon icon={faPrint} />
          </Button>
        </div>
      </div>
    );
  }
}
