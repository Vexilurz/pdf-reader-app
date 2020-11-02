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

const getCurrentIndexes = (state: IProjectFileState): IEventAndFileIndex => {
  const eventIndex = state.current.content.events.findIndex(
    (event) => event.id === state.currentPdf.eventID
  );
  const fileIndex = state.current.content.events[eventIndex]?.files.findIndex(
    (file) => file.path === state.currentPdf.path
  );
  return { fileIndex, eventIndex };
};

const getBookmarkIndex = (state: IProjectFileState, bookmark: IBookmark): number => {
  if (
    state.currentIndexes.eventIndex > -1 &&
    state.currentIndexes.fileIndex > -1
  ) {
    return state.current.content.events[state.currentIndexes.eventIndex].files[
      state.currentIndexes.fileIndex
    ].bookmarks.findIndex((b) => b.id === bookmark.id);
  } else return -1;
}

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
    deleteEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      const index = state.current.content.events.findIndex(
        (event) => event.id === payload.id
      );
      if (index > -1) state.current.content.events.splice(index, 1);
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
      state.currentIndexes = getCurrentIndexes(state);
    },
    calcCurrentIndexes: (state: IProjectFileState) => {
      state.currentIndexes = getCurrentIndexes(state);
    },
    addBookmark: (
      state: IProjectFileState,
      action: PayloadAction<IBookmark>
    ) => {
      const bookmark = action.payload;
      state.currentIndexes = getCurrentIndexes(state);
      if (
        state.currentIndexes.eventIndex > -1 &&
        state.currentIndexes.fileIndex > -1
      ) {
        state.current.content.events[state.currentIndexes.eventIndex].files[
          state.currentIndexes.fileIndex
        ].bookmarks.push(bookmark);
      }
    },
    updateBookmark: (
      state: IProjectFileState,
      action: PayloadAction<IBookmark>
    ) => {
      const bookmark = action.payload;
      state.currentIndexes = getCurrentIndexes(state);
      const index = getBookmarkIndex(state, bookmark);
      if (index > -1) {
        state.current.content.events[state.currentIndexes.eventIndex].files[
          state.currentIndexes.fileIndex
        ].bookmarks[index] = bookmark;
      }
    },
    deleteBookmark: (
      state: IProjectFileState,
      action: PayloadAction<IBookmark>
    ) => {
      const bookmark = action.payload;
      state.currentIndexes = getCurrentIndexes(state);
      const index = getBookmarkIndex(state, bookmark);
      if (index > -1) {
        state.current.content.events[state.currentIndexes.eventIndex].files[
          state.currentIndexes.fileIndex
        ].bookmarks.splice(index, 1);
      }
    },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
