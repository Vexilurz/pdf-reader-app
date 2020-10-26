import { createSlice } from '@reduxjs/toolkit';
import { IPDFdata } from '../types/pdf';

export interface IPDFViewerState {
  pdf: IPDFdata | null;
  loading: boolean;
}

const initialState: IPDFViewerState = {
  pdf: null,
  loading: true,
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setPdf: (state, action) => {
      const payload: IPDFdata = action.payload;
      if (payload) {
        state.pdf = payload;
      } else {
        state.pdf = null;
      }
    },
    setLoading: (state, action) => {
      const payload: boolean = action.payload;
      state.loading = payload;
    }
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
