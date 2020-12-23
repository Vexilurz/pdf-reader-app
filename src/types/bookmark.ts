import { v4 as uuidv4 } from 'uuid';

export interface IPdfSelection {
  startPage: number;
  startOffset: number;
  endPage: number;
  endOffset: number;
}

export interface IAreaSelection {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IBookmark {
  id: string;
  comment: string;
  isAreaSelection?: boolean;
  selection: IPdfSelection | IAreaSelection;
  color: string;
}

export const getInfSelection = (): IPdfSelection => {
  return {
    startOffset: Infinity,
    endOffset: Infinity,
    startPage: -1,
    endPage: -1,
  };
};

// bookmark factory
export const createBookmark = (
  comment: string,
  isAreaSelection: boolean,
  selection: IPdfSelection | IAreaSelection,
  color: string
): IBookmark => {
  return { id: uuidv4(), comment, isAreaSelection, selection, color };
};
