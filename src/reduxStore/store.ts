import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';
import pdfViewerReducer from './pdfViewerSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
    pdfViewer: pdfViewerReducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
