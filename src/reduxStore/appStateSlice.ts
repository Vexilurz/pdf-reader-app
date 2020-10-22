import { createSlice } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export const appStateSlice = createSlice({
  name: 'appState',
  initialState: {
    current: appConst.EVENT_FORM,
  },
  reducers: {
    setAppState: (state, { payload }) => {
      state.current = payload.current;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
