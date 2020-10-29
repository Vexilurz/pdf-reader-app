import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import { IProjectFileWithPath, getNewFile } from '../types/projectFile';
import { IEvent } from '../types/event';
import * as appConst from '../types/textConstants';

export interface IProjectFileState {
  current: IProjectFileWithPath;
  opened: IProjectFileWithPath[];
}

const initialState: IProjectFileState = {
  current: { path: '', content: getNewFile('') },
  opened: [],
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
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
