import { createSlice } from '@reduxjs/toolkit';
import { IProjectFileWithPath } from '../types/projectFile';

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
    // todo: add types to payloads
    setCurrentFile: (state, { payload }) => {
      if (payload) {
        const { path, content } = payload;
        state.current = { path, content };
      } else {
        state.current = null;
      }
    },
    addFileToOpened: (state, { payload }) => {
      const { path, content } = payload;
      const found = state.opened.find((item) => {
        return item.path === path;
      });
      if (!found) state.opened.push({ path, content });
    },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
