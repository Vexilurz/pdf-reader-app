import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPdfSelection, getInfSelection } from '../types/bookmark';

interface IScrollToIndex {
  value: number;
}

export interface IPDFViewerState {
  pdfSelection: IPdfSelection;
  editingBookmarkID: string;
  scrollToIndex: IScrollToIndex;
}

const initialState: IPDFViewerState = {
  pdfSelection: getInfSelection(),
  editingBookmarkID: '',
  scrollToIndex: { value: 0 },
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
    setScrollToIndex: (state: IPDFViewerState, action: PayloadAction<number>) => {
      const { payload } = action;
      state.scrollToIndex = payload;
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
