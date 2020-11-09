import { IEvent } from './event';

export interface IProjectFile {
  name: string;
  events: IEvent[];
}

export interface IProjectFileWithPath {
  path: string;
  content: IProjectFile;
}

export const getNewFile = (name: string): IProjectFile => {
  return {
    name,
    events: [],
  };
};
