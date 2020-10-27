import { v4 as uuidv4 } from 'uuid';

export interface IEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  files: string[];
}

export const NEW_EVENT: IEvent = {
  id: uuidv4(),
  title: '',
  description: '',
  date: new Date(),
  files: [],
};
