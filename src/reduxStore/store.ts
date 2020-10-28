import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';
import pdfViewerReducer from './pdfViewerSlice';
import editingEventReducer from './editingEventSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
    pdfViewer: pdfViewerReducer,
    editingEvent: editingEventReducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
