import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { IProjectFileWithPath, getNewFile } from '../types/projectFile';
import { IEvent } from '../types/event';
import { IBookmark } from '../types/bookmark';
import { IPdfFileWithBookmarks, getNewPdfFile } from '../types/pdf';
import * as appConst from '../types/textConstants';

interface IPdfFilePathWithEventID {
  path: string;
  eventID: string;
}

interface IEventAndFileIndex {
  fileIndex: number;
  eventIndex: number;
}

export interface IProjectFileState {
  current: IProjectFileWithPath;
  opened: IProjectFileWithPath[];
  currentPdf: IPdfFilePathWithEventID;
  currentIndexes: IEventAndFileIndex;
}

const initialState: IProjectFileState = {
  current: { path: '', content: getNewFile('') },
  opened: [],
  currentPdf: { path: '', eventID: '' },
  currentIndexes: { fileIndex: -1, eventIndex: -1 },
};

export const projectFileSlice = createSlice({
  name: 'projectFile',
  initialState,
  reducers: {
    setCurrentFile: (
      state: IProjectFileState,
      action: PayloadAction<IProjectFileWithPath>
    ) => {
      const { payload } = action;
      const { path, content } = payload;
      state.current = { path, content };
    },
    saveCurrentProject: (state: IProjectFileState, action) => {
      const { path } = state.current;
      if (path !== '') {
        const stringed = JSON.stringify(state.current.content);
        ipcRenderer.send(appConst.SAVE_CURRENT_PROJECT, {
          path: state.current.path,
          content: stringed,
        });
      }
    },
    addFileToOpened: (
      state: IProjectFileState,
      action: PayloadAction<IProjectFileWithPath>
    ) => {
      const { payload } = action;
      const { path, content } = payload;
      const index = state.opened.findIndex((item) => item.path === path);
      if (index === -1) state.opened.push({ path, content });
    },
    updateEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.current.content.events = state.current.content.events.map(
        (event) => {
          if (event.id === payload.id) return payload;
          return event;
        }
      );
    },
    addEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.current.content.events.push(payload);
    },
    setCurrentPdf: (
      state: IProjectFileState,
      action: PayloadAction<IPdfFilePathWithEventID>
    ) => {
      const { payload } = action;
      state.currentPdf = payload;

      const eventIndex = state.current.content.events.findIndex(
        (e) => e.id === payload.eventID
      );
      const fileIndex = state.current.content.events[
        eventIndex
      ].files.findIndex((f) => f.path === payload.path);
      state.currentIndexes = { fileIndex, eventIndex };
    },
    addBookmark: (
      state: IProjectFileState,
      action: PayloadAction<IBookmark>
    ) => {
      const bookmark = action.payload;
      state.current.content.events[state.currentIndexes.eventIndex].files[
        state.currentIndexes.fileIndex
      ].bookmarks.push(bookmark);
    },
    // deleteBookmark: (
    //   state: IProjectFileState,
    //   action: PayloadAction<IBookmark>
    // ) => {
    //   const bookmark = action.payload;

    //   const index = state.pdfFile.file.bookmarks.findIndex((b) => b.id === payload.id);
    //   if (index > -1) state.pdfFile.file.bookmarks.splice(index, 1);
    // },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
