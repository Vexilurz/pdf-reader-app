import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPdfFileWithBookmarks, getNewPdfFile } from '../types/pdf';
import { IBookmark } from '../types/bookmark';

interface IPdfSelection {
  start: number;
  end: number;
}

interface IPdfFileState {
  file: IPdfFileWithBookmarks;
  eventID: string;
}

export interface IPDFViewerState {
  pdfFile: IPdfFileState;
  pdfSelection: IPdfSelection;
}

const initialState: IPDFViewerState = {
  pdfFile: { file: getNewPdfFile(''), eventID: '' },
  pdfSelection: {
    start: Infinity,
    end: Infinity,
  },
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setPdfFile: (state: IPDFViewerState, action: PayloadAction<IPdfFileState>) => {
      const { payload } = action;
      state.pdfFile = payload;
    },
    addBookmark: (state: IPDFViewerState, action: PayloadAction<IBookmark>) => {
      const { payload } = action;
      state.pdfFile.file.bookmarks.push(payload);
    },
    deleteBookmark: (state: IPDFViewerState, action: PayloadAction<IBookmark>) => {
      const { payload } = action;
      const index = state.pdfFile.file.bookmarks.findIndex((b) => b.id === payload.id);
      if (index > -1) state.pdfFile.file.bookmarks.splice(index, 1);
    },
    setSelection: (state: IPDFViewerState, action: PayloadAction<IPdfSelection>) => {
      const { payload } = action;
      state.pdfSelection = payload;
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
