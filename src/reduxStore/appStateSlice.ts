import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export interface IAppState {
  current: string;
  showLoading: boolean;
}

const initialState: IAppState = {
  current: appConst.START_PAGE,
  showLoading: false,
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setAppState: (state: IAppState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.current = payload;
    },
    setShowLoading: (state: IAppState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.showLoading = payload;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
