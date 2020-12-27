import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPdfSelection, IAreaSelection, getInfSelection } from '../types/bookmark';

interface IScrollToIndex {
  value: number;
}

interface IBoolValue {
  value: boolean;
}

export interface IPDFViewerState {
  pdfSelection: IPdfSelection;
  areaSelection: IAreaSelection | null;
  areaSelectionEnable: IBoolValue;
  editingBookmarkID: string;
  scrollToPage: IScrollToIndex;
  needForceUpdate: IBoolValue;
}

const initialState: IPDFViewerState = {
  pdfSelection: getInfSelection(),
  areaSelection: null,
  areaSelectionEnable: { value: false },
  editingBookmarkID: '',
  scrollToPage: { value: 0 },
  needForceUpdate: { value: true },
};

export const pdfViewerSlice = createSlice({
  name: 'pdfViewer',
  initialState,
  reducers: {
    setSelection: (state: IPDFViewerState, action: PayloadAction<IPdfSelection>) => {
      const { payload } = action;
      state.pdfSelection = payload;
    },
    setAreaSelection: (state: IPDFViewerState, action: PayloadAction<IAreaSelection | null>) => {
      const { payload } = action;
      state.areaSelection = payload;
    },
    toggleAreaSelectionEnable: (state: IPDFViewerState) => {
      const tmp = { value: !state.areaSelectionEnable.value };
      state.areaSelectionEnable = tmp;
    },
    setEditingBookmarkID: (state: IPDFViewerState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.editingBookmarkID = payload;
    },
    setScrollToPage: (state: IPDFViewerState, action: PayloadAction<IScrollToIndex>) => {
      const { payload } = action;
      state.scrollToPage = payload;
    },
    setNeedForceUpdate: (state: IPDFViewerState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.needForceUpdate = { value: payload };
    },
  },
});

export const { actions } = pdfViewerSlice;

export default pdfViewerSlice.reducer;
