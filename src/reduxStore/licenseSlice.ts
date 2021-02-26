import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ipcRenderer } from 'electron';
import * as appConst from '../types/textConstants';

export interface ILicenseState {
  licenseDialogVisible: boolean;
  info: ILicenseInfo;
}

export interface ILicenseInfo {
  licenseKey: string;
  expiringDate: string;
  active?: boolean;
  daysLeft?: number;
}

const initialState: ILicenseState = {
  licenseDialogVisible: false,
  info: {
    licenseKey: '',
    expiringDate: '',
    active: false,
    daysLeft: 0,
  }
};

export const licenseSlice = createSlice({
  name: 'license',
  initialState,
  reducers: {
    setShowLicenseDialog: (state: ILicenseState, action: PayloadAction<boolean>) => {
      const { payload } = action;
      state.licenseDialogVisible = payload;
    },
    setLicenseInfo: (state: ILicenseState, action: PayloadAction<ILicenseInfo>) => {
      const { payload } = action;
      const info: ILicenseInfo = payload;
      info.daysLeft = ((new Date(info.expiringDate)).getTime() - (new Date()).getTime()) / (1000 * 3600 * 24);
      info.active = info.daysLeft > 0;
      state.info = info;
      if (info.licenseKey === appConst.TRIAL_KEY) {
        if (info.daysLeft > 0)
          ipcRenderer.send(appConst.CHANGE_TITLE, `(TRIAL, ${info.daysLeft.toFixed(0)} days left)`);
        else
          ipcRenderer.send(appConst.CHANGE_TITLE, `(TRIAL EXPIRED)`);
      } else {
        if (info.daysLeft > 0 && info.daysLeft < 14)
          ipcRenderer.send(appConst.CHANGE_TITLE, `(License: ${info.daysLeft.toFixed(0)} days left)`);
        else if (info.daysLeft <= 0)
          ipcRenderer.send(appConst.CHANGE_TITLE, `(License EXPIRED)`);
      };
    },
  },
});

export const { actions } = licenseSlice;

export default licenseSlice.reducer;
