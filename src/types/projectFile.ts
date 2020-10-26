import { IEvent } from './event';
import { IBookmark } from './bookmark';

export interface IProjectFile {
  name: string;
  events: IEvent[];
  bookmarks: IBookmark[];
}

export interface IProjectFileWithPath {
  path: string;
  content: IProjectFile | null;
}

export const newFile = (name: string): IProjectFile => {
  return {
    name,
    events: [],
    bookmarks: [],
  };
};

export const NEW_FILE: IProjectFile = {
  name: 'new file',
  events: [],
  bookmarks: [],
};

export const TEST_PROJECT: IProjectFile = {
  name: 'test project',
  events: [
    {
      title: 'event 1',
      description: 'description 1',
      date: new Date(),
      files: ['D:/qwe.pdf', 'D:/asd.pdf'],
    },
    {
      title: 'event 2',
      description: 'description 2',
      date: new Date(),
      files: ['D:/zxc.pdf'],
    },
  ],
  bookmarks: [
    {
      comment: 'comment 1',
      file: 'qwe.pdf',
      start: 5,
      end: 10,
      color: 'red',
    },
    {
      comment: 'comment 2',
      file: 'asd.pdf',
      start: 100,
      end: 130,
      color: 'blue',
    },
    {
      comment: 'comment 5',
      file: 'zxc.pdf',
      start: 15,
      end: 20,
      color: 'red',
    },
    {
      comment: 'comment 6',
      file: 'zxc.pdf',
      start: 300,
      end: 330,
      color: 'blue',
    },
  ],
};
