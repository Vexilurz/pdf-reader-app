import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';

export interface IProps {
  onSetScale(scale: number): void;
}

export const PdfScaleControls = ({ onSetScale }: IProps) => {
  const [scale, setScale] = useState(1);

  const step = 0.2;

  const setScaleMain = (value: number) => {
    setScale(value);
    onSetScale(value);
  };

  const increment = () => {
    setScaleMain(scale + step);
  };

  const decrement = () => {
    if (scale > 0.21) setScaleMain(scale - step);
  };

  return (
    <>
      <ButtonGroup aria-label="Basic example">
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={decrement}
        >
          <FontAwesomeIcon icon={faMinus} color={'black'} />
        </Button>
        <Button
          variant="secondary"
          style={{ backgroundColor: '#eeeeee', borderColor: '#eeeeee' }}
          onClick={increment}
        >
          <FontAwesomeIcon icon={faPlus} color={'black'} />
        </Button>
      </ButtonGroup>
      <Dropdown>
        <Dropdown.Toggle
          variant="secondary"
          id="dropdown-basic"
          style={{
            backgroundColor: '#dcdce0',
            borderColor: '#dcdce0',
            color: 'black',
          }}
        >
          {`${(scale * 100).toFixed(0)}%`}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {Array.from(new Array(16), (el, index) => {
            return (
              <Dropdown.Item
                key={`scale${index}`}
                onClick={() => {
                  setScaleMain(0.5 + index * 0.1);
                }}
              >
                {`${50 + index * 10}%`}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};
