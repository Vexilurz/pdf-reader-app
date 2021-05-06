import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';
import pdfViewerReducer from './pdfViewerSlice';
import editingEventReducer from './editingEventSlice';
import licenseReducer from './licenseSlice';
import dimensionReducer from './dimensionSlice';
import searchReducer from './searchSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
    pdfViewer: pdfViewerReducer,
    editingEvent: editingEventReducer,
    license: licenseReducer,
    dimensions: dimensionReducer,
    search: searchReducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
