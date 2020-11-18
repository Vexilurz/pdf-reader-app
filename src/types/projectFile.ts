import { v4 as uuidv4 } from 'uuid';
import { IEvent } from './event';

export interface IProjectFile {
  name: string;
  events: IEvent[];
}

export interface IProjectFileWithPath {
  id: string;
  path: string;
  content: IProjectFile;
}

export const getNewFile = (name: string): IProjectFile => {
  return {
    name,
    events: [],
  };
};

export const getNewFileWithPath = (name: string): IProjectFileWithPath => {
  return { id: uuidv4(), path: '', content: getNewFile(name) };
};
