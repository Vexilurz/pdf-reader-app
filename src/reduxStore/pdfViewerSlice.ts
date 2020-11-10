import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPdfSelection, getInfSelection } from '../types/bookmark';

export interface IPDFViewerState {
  pdfSelection: IPdfSelection;
  editingBookmarkID: string;
}

const initialState: IPDFViewerState = {
  pdfSelection: getInfSelection(),
  editingBookmarkID: '',
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setSelection: (state: IPDFViewerState, action: PayloadAction<IPdfSelection>) => {
      const { payload } = action;
      state.pdfSelection = payload;
    },
    setEditingBookmarkID: (state: IPDFViewerState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.editingBookmarkID = payload;
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
