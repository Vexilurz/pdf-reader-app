import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    setAppState: (state: IAppState, action: PayloadAction<IAppState>) => {
      const { payload } = action;
      state.current = payload.current;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
