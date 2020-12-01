import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

export interface IPdfSearchInputProps {
  onSetPattern(searchPattern: string): void;
  width: number;
}
export interface IPdfToolBarState {
  searchValue: string;
}

export const PdfSearchInput = ({
  onSetPattern,
  width,
}: IPdfSearchInputProps) => {
  const [searchValue, setSearchValue] = useState<string>('');

  const clearSearchField = () => {
    setSearchValue('');
    onSetPattern('');
  };

  const onSearchFieldChange = (e: any) => {
    setSearchValue(e.target.value);
  };

  const applySearchPattern = () => {
    onSetPattern(searchValue);
  };

  return (
    <InputGroup className="mb-3" style={{ width }}>
      <InputGroup.Prepend>
        <Button variant="outline-secondary" onClick={applySearchPattern}>
          <FontAwesomeIcon icon={faSearch} />
        </Button>
      </InputGroup.Prepend>
      <FormControl value={searchValue} onChange={onSearchFieldChange} />
      <InputGroup.Append hidden={!searchValue}>
        <Button onClick={clearSearchField}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
};
