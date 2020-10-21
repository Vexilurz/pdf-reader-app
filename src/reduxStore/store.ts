import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from './appStateSlice';
import projectFileReducer from './projectFileSlice';

export default configureStore({
  reducer: {
    appState: appStateReducer,
    projectFile: projectFileReducer,
  },
});
