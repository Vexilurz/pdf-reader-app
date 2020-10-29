import { IBookmark } from './bookmark';

export interface IPDFdata {
  data: Uint8Array;
}

export interface IPdfFileWithBookmarks {
  path: string;
  bookmarks: IBookmark[];
}

export const getNewPdfFile = (path: string): IPdfFileWithBookmarks => {
  return { path, bookmarks: [] };
};
