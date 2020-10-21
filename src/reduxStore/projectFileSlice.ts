import { createSlice } from '@reduxjs/toolkit';
import { IProjectFile } from '../types/projectFile';

export const projectFileSlice = createSlice({
  name: 'projectFile',
  initialState: {
    path: '',
    content: {},
  },
  reducers: {
    setFile: (state, { payload }) => {
      state.path = payload.path;
      state.content = payload.content;
    },
  },
});

export const { setFile } = projectFileSlice.actions;

export interface IProjectFileProps {
  path: string;
  content: IProjectFile;
  setFile: typeof setFile;
}

export default projectFileSlice.reducer;
