import { createSlice } from '@reduxjs/toolkit';

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    // can be: 'start-page', 'pdf-viewer', 'event-form'
    current: 'start-page',
  },
  reducers: {
    setAppState: (state, { payload }) => {
      state.current = payload.current;
    },
  },
});

export const { setAppState } = appStateSlice.actions;

export interface IAppStateProps {
  current: string;
  setAppState: typeof setAppState;
}

export default appStateSlice.reducer;
