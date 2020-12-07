import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
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
  // const [pageNumber, setPageNumber] = useState<number>(1);

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
      <InputGroup.Prepend>
        <Button variant="outline-secondary" onClick={decrement}>
          <FontAwesomeIcon icon={faAngleUp} />
        </Button>
        <Button variant="outline-secondary" onClick={increment}>
          <FontAwesomeIcon icon={faAngleDown} />
        </Button>
      </InputGroup.Prepend>
      <FormControl
        value={currentPage}
        onKeyPress={(e) => {
          if (e.charCode === 13) {
            // TODO: can't edit
          }
        }}
      />
      {`  of ${numPages}`}
    </InputGroup>
  );
};
