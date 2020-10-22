import { createSlice } from '@reduxjs/toolkit';

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    // can be: 'start-page', 'new-file-form', 'pdf-viewer', 'event-form'
    current: 'start-page',
  },
  reducers: {
    setAppState: (state, { payload }) => {
      state.current = payload.current;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
