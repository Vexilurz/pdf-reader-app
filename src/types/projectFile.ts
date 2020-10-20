import { IEvent } from './event';
import { IBookmark } from './bookmark';

export interface IProjectFile {
  name: string;
  events: IEvent[];
  bookmarks: IBookmark[];
}

export const TEST_PROJECT: IProjectFile = {
  name: 'test project',
  events: [
    {
      title: 'event 1',
      description: 'description 1',
      date: new Date(),
      files: ['qwe.pdf', 'asd.pdf'],
    },
    {
      title: 'event 2',
      description: 'description 2',
      date: new Date(),
      files: ['zxc.pdf'],
    },
  ],
  bookmarks: [
    {
      comment: 'comment 1',
      start: 5,
      end: 10,
      color: 'red',
    },
    {
      comment: 'comment 2',
      start: 100,
      end: 130,
      color: 'blue',
    },
  ],
};
