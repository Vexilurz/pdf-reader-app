import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IEvent, getNewEvent } from '../types/event';

export interface IEditingEventState {
  event: IEvent;
}

const initialState: IEditingEventState = {
  event: getNewEvent(),
};

export const editingEventSlice = createSlice({
  name: 'editingEvent',
  initialState,
  reducers: {
    setEditingEvent: (state: IEditingEventState, action: PayloadAction<IEvent>) => {
      const { payload } = action;
      state.event = payload;
    },
  },
});

export const { actions } = editingEventSlice;

export default editingEventSlice.reducer;
