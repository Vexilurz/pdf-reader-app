import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProjectFileWithPath } from '../types/projectFile';
import { IEvent } from '../types/event';

export interface IProjectFileState {
  current: IProjectFileWithPath | null;
  opened: IProjectFileWithPath[];
}

const initialState: IProjectFileState = {
  current: null,
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
      if (payload) {
        const { path, content } = payload;
        state.current = { path, content };
      } else {
        state.current = null;
      }
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
    setEvent: (state: IProjectFileState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      const found = state.current?.content?.events?.find((item) => {
        return item.id === payload.id;
      });
      if (found) {
        found.title = payload.title;
        found.description = payload.description;
        found.date = payload.date;
        found.files = payload.files;
      } else {
        state.current?.content?.events?.push(payload);
      }
    },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
