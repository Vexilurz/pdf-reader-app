import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export interface ILicenseState {
  licenseDialogVisible: boolean;
}

const initialState: ILicenseState = {
  licenseDialogVisible: false,
};

export const licenseSlice = createSlice({
  name: 'license',
  initialState,
  reducers: {
    setShowLicenseDialog: (state: ILicenseState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.licenseDialogVisible = payload;
    },
  },
});

export const { actions } = licenseSlice;

export default licenseSlice.reducer;
