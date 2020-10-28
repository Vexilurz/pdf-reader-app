import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectFileWithPath, getNewFile } from '../types/projectFile';
import { IEvent } from '../types/event';

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
    addFileToOpened: (
      state: IProjectFileState,
      action: PayloadAction<IProjectFileWithPath>
    ) => {
      const { payload } = action;
      const { path, content } = payload;
      const found = state.opened.find((item) => {
        return item.path === path;
      });
      if (!found) state.opened.push({ path, content });
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
