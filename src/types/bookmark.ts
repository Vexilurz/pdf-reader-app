import { v4 as uuidv4 } from 'uuid';

export interface IBookmark {
  id: string;
  comment: string;
  start: number;
  end: number;
  color: string;
  needToEdit: boolean;
}

// bookmark factory
export const createBookmark = (
  comment: string,
  start: number,
  end: number,
  color: string
): IBookmark => {
  return { id: uuidv4(), comment, start, end, color, needToEdit: true };
};
