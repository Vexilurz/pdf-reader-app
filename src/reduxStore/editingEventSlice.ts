import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEvent, getNewEvent } from '../types/event';

export interface IEditingEventState {
  event: IEvent;
  isNew: boolean;
}

const initialState: IEditingEventState = {
  event: getNewEvent(),
  isNew: true,
};

export const editingEventSlice = createSlice({
  name: 'editingEvent',
  initialState,
  reducers: {
    setEditingEvent: (state: IEditingEventState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.event = payload;
    },
    setIsNew: (state: IEditingEventState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.isNew = payload;
    },
  },
});

export const { actions } = editingEventSlice;

export default editingEventSlice.reducer;
