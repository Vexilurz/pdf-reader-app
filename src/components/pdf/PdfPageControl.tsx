import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

export interface IProps {
  width: number;
  onSetPageNumber(pageNumber: number): void;
  numPages: number;
  currentPage: number;
}

export const PdfPageControl = ({
  width,
  onSetPageNumber,
  numPages,
  currentPage,
}: IProps) => {
  const increment = () => {
    if (currentPage < numPages) {
      onSetPageNumber(currentPage + 1);
    }
  };

  const decrement = () => {
    if (currentPage > 1) {
      onSetPageNumber(currentPage - 1);
    }
  };

  return (
    <InputGroup style={{ width }}>
      {/* <InputGroup.Prepend>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={decrement}
        >
          <FontAwesomeIcon icon={faArrowUp} color={'black'} />
        </Button>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={increment}
        >
          <FontAwesomeIcon icon={faArrowDown} color={'black'} />
        </Button>
      </InputGroup.Prepend> */}

      <div className="page-count-label">
        <span>
          <b>{currentPage}</b>
        </span>
        <span>of</span>
        <span>{numPages}</span>
      </div>
    </InputGroup>
  );
};
