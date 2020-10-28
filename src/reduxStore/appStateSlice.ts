import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';
import { IEvent, getNewEvent } from '../types/event';

export interface IAppState {
  current: string;
  editingEvent: IEvent;
}

const initialState: IAppState = {
  current: appConst.START_PAGE,
  editingEvent: getNewEvent(),
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setAppState: (state: IAppState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.current = payload;
    },
    editEvent: (state: IAppState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.editingEvent = payload;
      state.current = appConst.EVENT_FORM;
    },
  },
});

export const { actions } = appStateSlice;

export default appStateSlice.reducer;
