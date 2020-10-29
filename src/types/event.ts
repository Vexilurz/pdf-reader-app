import { v4 as uuidv4 } from 'uuid';
import { IBookmark } from './bookmark';

interface IPdfFileWithBookmarks {
  path: string;
  bookmarks: IBookmark[];
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  files: IPdfFileWithBookmarks[];
}

export const getNewEvent = (): IEvent => ({
  id: uuidv4(),
  title: '',
  description: '',
  date: new Date().toTimeString(),
  files: [],
});
