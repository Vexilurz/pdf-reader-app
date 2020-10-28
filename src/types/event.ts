import { v4 as uuidv4 } from 'uuid';

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  files: string[];
  isNew: boolean;
}

export const getNewEvent = (): IEvent => ({
  id: uuidv4(),
  title: '',
  description: '',
  date: '',
  files: [],
  isNew: true,
});
