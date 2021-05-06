import { faRecordVinyl } from '@fortawesome/free-solid-svg-icons';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IResultIndex {
  page: number;
  index: number;
}

export interface ISearchState {
  results: Object;
  currentResult: IResultIndex;
}

const initialState: ISearchState = {
  results: {},
  currentResult: { page: 1, index: 1 },
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    addResult: (state: ISearchState, action: PayloadAction<IResultIndex>) => {
      const { payload } = action;
      const obj = { ...state.results };
      obj[payload.page] = payload.index;
      state.results = obj;
      console.log(state.results)
    },
    setCurrentResult: (state: ISearchState, action: PayloadAction<IResultIndex>) => {
      const { payload } = action;
      state.currentResult = payload;
    },
  },
});

export const { actions } = searchSlice;

export default searchSlice.reducer;
