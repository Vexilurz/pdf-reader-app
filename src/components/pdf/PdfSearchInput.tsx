import {
  faAngleDown,
  faAngleUp,
  faSearch,
  faTimes,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

export interface IProps {
  onSetPattern(searchPattern: string): void;
  prevSearchRes(): void;
  nextSearchRes(): void;
  currentSearchResNum: number;
  totalSearchResCount: number;
  width: number;
}

export const PdfSearchInput = ({
  onSetPattern,
  width,
  prevSearchRes,
  nextSearchRes,
  currentSearchResNum,
  totalSearchResCount,
}: IProps) => {
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
    <InputGroup style={{ width }}>
      <InputGroup.Prepend>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={applySearchPattern}
        >
          <FontAwesomeIcon icon={faSearch} color={'black'} />
        </Button>
      </InputGroup.Prepend>
      <FormControl value={searchValue} onChange={onSearchFieldChange} />
      <InputGroup.Append hidden={!searchValue}>
        <Button onClick={clearSearchField}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      </InputGroup.Append>
      <InputGroup.Append>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={prevSearchRes}
        >
          <FontAwesomeIcon icon={faArrowUp} color={'black'} />
        </Button>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={nextSearchRes}
        >
          <FontAwesomeIcon icon={faArrowDown} color={'black'} />
        </Button>
      </InputGroup.Append>
    </InputGroup>
  );
};
