import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as appConst from '../types/textConstants';

export interface ILicenseState {
  licenseDialogVisible: boolean;
  licenseKey: string;
  expiringDate: string;
  active: boolean;
}

const initialState: ILicenseState = {
  licenseDialogVisible: false,
  licenseKey: '',
  expiringDate: '',
  active: false,
};

export const licenseSlice = createSlice({
  name: 'license',
  initialState,
  reducers: {
    setShowLicenseDialog: (state: ILicenseState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.licenseDialogVisible = payload;
    },
    setLicenseKey: (state: ILicenseState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.licenseKey = payload;
      console.log('licenseKey: ', state.licenseKey);
    },
    setExpiringDate: (state: ILicenseState, action: PayloadAction<string>) => {
      const { payload } = action;
      state.expiringDate = payload;
      state.active = (((new Date(payload)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24)) > 0;
      console.log('expiring: ', state.expiringDate, ' active: ', state.active);
    },
  },
});

export const { actions } = licenseSlice;

export default licenseSlice.reducer;
