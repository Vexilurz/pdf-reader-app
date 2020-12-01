import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';
import { PdfSearchInput } from './PdfSearchInput';
import './pdfToolBar.scss';

export interface IPdfToolBarProps {
  pdfName: string;
  onSetPattern(searchPattern: string): void;
}
export interface IPdfToolBarState {}

export class PdfToolBar extends React.Component<
  IPdfToolBarProps,
  IPdfToolBarState
> {
  private searchRef: React.RefObject<any>;

  constructor(props: IPdfToolBarProps & IPdfToolBarState) {
    super(props);
    this.searchRef = React.createRef();
  }

  render(): React.ReactElement {
    const { pdfName, onSetPattern } = this.props;
    return (
      <div className="pdf-toolbar-container">
        <h2>{pdfName}</h2>
        <div className="pdf-search">
          <PdfSearchInput onSetPattern={onSetPattern} width={250} />
        </div>
      </div>
    );
  }
}
