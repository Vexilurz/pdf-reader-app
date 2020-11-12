import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import React from 'react';
import * as appConst from '../types/textConstants';

export interface IAppState {
  current: string;
  showLoading: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;
  mainContainerWidth: number;
}

const initialState: IAppState = {
  current: appConst.START_PAGE,
  showLoading: false,
  leftSidebarWidth: 350,
  rightSidebarWidth: 350,
  mainContainerWidth: 1000,
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
    setLeftSidebarWidth: (state: IAppState, action: PayloadAction<number>) => {
      const { payload } = action;
      state.leftSidebarWidth = payload;
    },
    setRightSidebarWidth: (state: IAppState, action: PayloadAction<number>) => {
      const { payload } = action;
      state.rightSidebarWidth = payload;
    },
    setMainContainerWidth: (state: IAppState, action: PayloadAction<number>) => {
      const { payload } = action;
      state.mainContainerWidth = payload;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
