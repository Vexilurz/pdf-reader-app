import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IDimensions {
  height: number;
  width: number;
}

const defaultDim: IDimensions = {
  height: 455,
  width: 0,
}

export interface IDimensionState {
  document: IDimensions;
  page: IDimensions;
}

const initialState: IDimensionState = {
  document: defaultDim,
  page: defaultDim,
};

export const dimensionSlice = createSlice({
  name: 'dimensions',
  initialState,
  reducers: {
    setDocumentDimensions: (state: IDimensionState, action: PayloadAction<IDimensions>) => {
      const { payload } = action;
      state.document = payload;
    },
    setPageDimensions: (state: IDimensionState, action: PayloadAction<IDimensions>) => {
      const { payload } = action;
      state.page = payload;
    },
  },
});

export const { actions } = dimensionSlice;

export default dimensionSlice.reducer;
