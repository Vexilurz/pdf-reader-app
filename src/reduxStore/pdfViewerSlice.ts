import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IPdfSelection {
  start: number;
  end: number;
}

export interface IPDFViewerState {
  pdfSelection: IPdfSelection;
}

const initialState: IPDFViewerState = {
  pdfSelection: {
    start: Infinity,
    end: Infinity,
  },
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setSelection: (state: IPDFViewerState, action: PayloadAction<IPdfSelection>) => {
      const { payload } = action;
      state.pdfSelection = payload;
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
