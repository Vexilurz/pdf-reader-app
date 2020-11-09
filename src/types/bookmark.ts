import { v4 as uuidv4 } from 'uuid';

export interface IPdfSelection {
  start: number;
  end: number;
  startContainerID: string;
}

export interface IBookmark {
  id: string;
  comment: string;
  selection: IPdfSelection;
  color: string;
}

export const getInfSelection = (): IPdfSelection => {
  return {
    start: Infinity,
    end: Infinity,
    startContainerID: '',
  };
};

// bookmark factory
export const createBookmark = (
  comment: string,
  selection: IPdfSelection,
  color: string
): IBookmark => {
  return { id: uuidv4(), comment, selection, color };
};
