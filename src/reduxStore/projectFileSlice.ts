import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { IProjectFileWithPath, getNewFile } from '../types/projectFile';
import { IEvent } from '../types/event';
import { IBookmark } from '../types/bookmark';
import { IPdfFileWithBookmarks, getNewPdfFile } from '../types/pdf';
import * as appConst from '../types/textConstants';
import { actions as appStateActions } from './appStateSlice';

interface IPdfFilePathWithEventID {
  path: string;
  eventID: string;
}

interface IEventAndFileIndex {
  fileIndex: number;
  eventIndex: number;
}

export interface IProjectFileState {
  currentProjectFile: IProjectFileWithPath;
  openedProjectFiles: IProjectFileWithPath[];
  currentPdf: IPdfFilePathWithEventID;
  currentIndexes: IEventAndFileIndex;
}

const initialState: IProjectFileState = {
  currentProjectFile: { path: '', content: getNewFile('') },
  openedProjectFiles: [],
  currentPdf: { path: '', eventID: '' },
  currentIndexes: { fileIndex: -1, eventIndex: -1 },
};

const getCurrentIndexes = (state: IProjectFileState): IEventAndFileIndex => {
  const eventIndex = state.currentProjectFile.content.events.findIndex(
    (event) => event.id === state.currentPdf.eventID
  );
  const fileIndex = state.currentProjectFile.content.events[
    eventIndex
  ]?.files.findIndex((file) => file.path === state.currentPdf.path);
  return { fileIndex, eventIndex };
};

const getBookmarkIndex = (state: IProjectFileState, bookmark: IBookmark): number => {
  if (
    state.currentIndexes.eventIndex > -1 &&
    state.currentIndexes.fileIndex > -1
  ) {
    return state.currentProjectFile.content.events[state.currentIndexes.eventIndex].files[
      state.currentIndexes.fileIndex
    ].bookmarks.findIndex((b) => b.id === bookmark.id);
  } else return -1;
};

const sortEventsByDate = (events: IEvent[]) => {
  events.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });
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
      state.currentProjectFile = { path, content };
      state.currentPdf = { path: '', eventID: '' };
    },
    saveCurrentProject: (state: IProjectFileState) => {
      const { path } = state.currentProjectFile;
      if (path !== '') {
        const stringed = JSON.stringify(state.currentProjectFile.content);
        ipcRenderer.send(appConst.SAVE_CURRENT_PROJECT, {
          path: state.currentProjectFile.path,
          content: stringed,
        });
      }
    },
    saveCurrentProjectTemporary: (state: IProjectFileState) => {
      const { path } = state.currentProjectFile;
      if (path !== '') {
        const index = state.openedProjectFiles.findIndex(
          (item) => item.path === path
        );
        if (index > -1) {
          state.openedProjectFiles[index] = state.currentProjectFile;
        }
      }
    },
    addFileToOpened: (
      state: IProjectFileState,
      action: PayloadAction<IProjectFileWithPath>
    ) => {
      const { payload } = action;
      const { path } = payload;
      const index = state.openedProjectFiles.findIndex((item) => item.path === path);
      if (index === -1) state.openedProjectFiles.push(payload);
      else state.openedProjectFiles[index] = payload;
    },
    deleteFileFromOpened: (
      state: IProjectFileState,
      action: PayloadAction<string>
    ) => {
      const path = action.payload;
      const index = state.openedProjectFiles.findIndex((item) => item.path === path);
      if (index > -1) {
        state.openedProjectFiles.splice(index, 1);
      }
    },
    addEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.currentProjectFile.content.events.push(payload);
      sortEventsByDate(state.currentProjectFile.content.events);
    },
    updateEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.currentProjectFile.content.events = state.currentProjectFile.content.events.map(
        (event) => {
          if (event.id === payload.id) return payload;
          return event;
        }
      );
      sortEventsByDate(state.currentProjectFile.content.events);
    },
    deleteEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      const index = state.currentProjectFile.content.events.findIndex(
        (event) => event.id === payload.id
      );
      if (index > -1) {
        state.currentProjectFile.content.events.splice(index, 1);
        state.currentIndexes = getCurrentIndexes(state);
      }
    },
    setCurrentPdf: (
      state: IProjectFileState,
      action: PayloadAction<IPdfFilePathWithEventID>
    ) => {
      const { payload } = action;
      state.currentPdf = payload;
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
        state.currentProjectFile.content.events[state.currentIndexes.eventIndex].files[
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
        state.currentProjectFile.content.events[state.currentIndexes.eventIndex].files[
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
        state.currentProjectFile.content.events[state.currentIndexes.eventIndex].files[
          state.currentIndexes.fileIndex
        ].bookmarks.splice(index, 1);
      }
    },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
