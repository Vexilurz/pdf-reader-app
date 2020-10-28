import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IPDFViewerState {
  pdfPath: string;
}

const initialState: IPDFViewerState = {
  pdfPath: '',
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setPdfPath: (state: IPDFViewerState, action: PayloadAction<string>) => {
      const { payload } = action;
      if (payload) {
        state.pdfPath = payload;
      } else {
        state.pdfPath = '';
      }
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
