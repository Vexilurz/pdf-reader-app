import { IEvent } from './event';
import { IBookmark } from './bookmark';

export interface IProjectFile {
  name: string;
  events: IEvent[];
  bookmarks: IBookmark[];
}

export interface IProjectFileWithPath {
  path: string;
  content: IProjectFile;
}

export const getNewFile = (name: string): IProjectFile => {
  return {
    name,
    events: [],
    bookmarks: [],
  };
};
