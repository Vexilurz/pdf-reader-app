import { IBookmark } from './bookmark';

export interface IPDFFile {
  path: string;
  bookmarks: IBookmark[];
}
