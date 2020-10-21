import { createSlice } from '@reduxjs/toolkit';
import { TEST_PROJECT } from '../types/projectFile'

export const projectFileSlice = createSlice({
  name: 'projectFile',
  initialState: {
    path: '',
    content: TEST_PROJECT, // todo: replace to {}
  },
  reducers: {
    setFilePath: (state, action) => {
      state.path = action.payload;
    },
  },
});

export const { setFilePath } = projectFileSlice.actions;

export interface IOpenFileProps {
  path: string;
  setFilePath: typeof setFilePath;
}

export default projectFileSlice.reducer;
