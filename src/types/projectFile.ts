import { IEvent } from './event';

export interface IProjectFile {
  name: string;
  events: IEvent[];
}

export const newFile = (name: string): IProjectFile => {
  return {
    name,
    events: [],
  };
};

export const NEW_FILE: IProjectFile = {
  name: 'new file',
  events: [],
};

export const TEST_PROJECT: IProjectFile = {
  name: 'test project',
  events: [
    {
      title: 'event 1',
      description: 'description 1',
      date: new Date(),
      files: [
        {
          path: 'qwe.pdf',
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
        },
        {
          path: 'asd.pdf',
          bookmarks: [
            {
              comment: 'comment 3',
              start: 15,
              end: 110,
              color: 'red',
            },
            {
              comment: 'comment 4',
              start: 1100,
              end: 1130,
              color: 'blue',
            },
          ],
        },
      ],
    },
    {
      title: 'event 2',
      description: 'description 2',
      date: new Date(),
      files: [
        {
          path: 'zxc.pdf',
          bookmarks: [
            {
              comment: 'comment 5',
              start: 15,
              end: 20,
              color: 'red',
            },
            {
              comment: 'comment 6',
              start: 300,
              end: 330,
              color: 'blue',
            },
          ],
        },
      ],
    },
  ],
};
