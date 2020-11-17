import { v4 as uuidv4 } from 'uuid';
import { IPdfFileWithBookmarks } from './pdf';

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
  date: new Date().toISOString(),
  files: [],
});
