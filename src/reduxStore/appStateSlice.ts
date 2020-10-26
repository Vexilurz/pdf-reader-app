import { createSlice } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export interface IAppState {
  current: string;
}

const initialState: IAppState = {
  current: appConst.START_PAGE,
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setAppState: (state, action) => {
      const payload: IAppState = action.payload;
      state.current = payload.current;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
