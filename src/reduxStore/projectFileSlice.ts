import * as pathLib from 'path';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { IProjectFileWithPath, getNewFileWithPath } from '../types/projectFile';
import { IEvent } from '../types/event';
import { IBookmark } from '../types/bookmark';
import { IPdfFileWithBookmarks, getNewPdfFile } from '../types/pdf';
import * as appConst from '../types/textConstants';
import { actions as appStateActions } from './appStateSlice';

interface IPdfFilePathWithEventID {
  path: string;
  eventID: string;
}

export interface IEventAndFileIndex {
  fileIndex: number;
  eventIndex: number;
}

export interface IPathWithProjectID {
  ID: string;
  path: string;
}

export interface IProjectFileState {
  currentProjectFile: IProjectFileWithPath;
  openedProjectFiles: IProjectFileWithPath[];
  currentPdf: IPdfFilePathWithEventID;
  currentIndexes: IEventAndFileIndex;
}

const initialState: IProjectFileState = {
  currentProjectFile: getNewFileWithPath(''),
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
  ]?.files.findIndex((file) => pathLib.basename(file.path) === pathLib.basename(state.currentPdf.path));
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
    return new Date(b.date) - new Date(a.date);
  });
};

const _saveCurrentProjectTemporary = (state: IProjectFileState) => {
  const { id } = state.currentProjectFile;
  const index = state.openedProjectFiles.findIndex(
    (item) => item.id === id
  );
  if (index > -1) {
    state.openedProjectFiles[index] = state.currentProjectFile;
  }
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
      ipcRenderer.send(appConst.CREATE_FOLDER_IN_CACHE, payload.id);
      state.currentProjectFile = payload;
      state.currentPdf = { path: '', eventID: '' };
    },
    setCurrentFileHaveChanges: (
      state: IProjectFileState,
      action: PayloadAction<boolean>
    ) => {
      const { payload } = action;
      state.currentProjectFile.haveChanges = payload;
    },
    setCurrentPdf: (
      state: IProjectFileState,
      action: PayloadAction<IPdfFilePathWithEventID>
    ) => {
      const { payload } = action;
      state.currentPdf = payload;
      state.currentIndexes = getCurrentIndexes(state);
    },
    saveCurrentProject: (state: IProjectFileState) => {
      const { path } = state.currentProjectFile;
      if (path !== '') {
        ipcRenderer.send(appConst.SAVE_CURRENT_PROJECT, {
          id: state.currentProjectFile.id,
          path: state.currentProjectFile.path,
          content: JSON.stringify(state.currentProjectFile.content),
        });
        state.currentProjectFile.haveChanges = false;
        _saveCurrentProjectTemporary(state);
      }
    },
    saveProjectByID: (state: IProjectFileState, action: PayloadAction<string>) => {
      const { payload } = action; // id
      const prj = state.openedProjectFiles.find((item) => item.id === payload);
      if (prj) {
        const { path } = prj;
        if (path !== '') {
          ipcRenderer.send(appConst.SAVE_CURRENT_PROJECT, {
            id: prj.id,
            path: prj.path,
            content: JSON.stringify(prj.content),
          });
          // prj.haveChanges = false;
        }
      }
    },
    setProjectPathByID: (state: IProjectFileState, action: PayloadAction<IPathWithProjectID>) => {
      const { payload } = action;
      const { ID, path } = payload;
      const prjIndex = state.openedProjectFiles.findIndex((item) => item.id === ID);
      if (prjIndex !== -1) {
        const prj = { ...state.openedProjectFiles[prjIndex], path };
        state.openedProjectFiles[prjIndex] = prj;
      }
    },
    saveCurrentProjectTemporary: (state: IProjectFileState) => {
      _saveCurrentProjectTemporary(state);
    },
    addFileToOpened: (
      state: IProjectFileState,
      action: PayloadAction<IProjectFileWithPath>
    ) => {
      const { payload } = action;
      const { id } = payload;
      const index = state.openedProjectFiles.findIndex((item) => item.id === id);
      if (index === -1) state.openedProjectFiles.push(payload);
      else state.openedProjectFiles[index] = payload;
    },
    deleteFileFromOpened: (
      state: IProjectFileState,
      action: PayloadAction<string>
    ) => {
      const id = action.payload;
      const index = state.openedProjectFiles.findIndex((item) => item.id === id);
      if (index > -1) {
        ipcRenderer.send(appConst.DELETE_FOLDER_FROM_CACHE, id);
        state.openedProjectFiles.splice(index, 1);
      }
    },
    updateEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      const index = state.currentProjectFile.content.events.findIndex(
        (event) => event.id === payload.id
      );
      if (index > -1) {
        state.currentProjectFile.content.events = state.currentProjectFile.content.events.map(
          (event) => {
            if (event.id === payload.id) return payload;
            return event;
          }
        );
      } else {
        state.currentProjectFile.content.events.push(payload);
      }
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
