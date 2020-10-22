import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';

export const store = configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
  },
});

export type StoreType = ReturnType<typeof store.getState>;
