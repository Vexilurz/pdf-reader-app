import { createSlice } from '@reduxjs/toolkit';
import { IProjectFile } from '../types/projectFile';

interface IProjectFileState {
  path: string;
  content: IProjectFile | null;
}

const initialState: IProjectFileState = {
  path: '',
  content: null,
};

export const projectFileSlice = createSlice({
  name: 'projectFile',
  initialState,
  reducers: {
    setFile: (state, { payload }) => {
      state.path = payload.path;
      state.content = payload.content;
    },
  },
});

export const { actions } = projectFileSlice;

export default projectFileSlice.reducer;
