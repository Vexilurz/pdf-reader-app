import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export interface IAppState {
  current: string;
  pdfLoading: boolean;
}

const initialState: IAppState = {
  current: appConst.START_PAGE,
  pdfLoading: false,
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setAppState: (state: IAppState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.current = payload;
    },
    setPdfLoading: (state: IAppState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.pdfLoading = payload;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
