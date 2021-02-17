import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';
import pdfViewerReducer from './pdfViewerSlice';
import editingEventReducer from './editingEventSlice';
import licenseReducer from './licenseSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
    pdfViewer: pdfViewerReducer,
    license: licenseReducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
