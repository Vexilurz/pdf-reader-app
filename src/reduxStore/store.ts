import { configureStore } from '@reduxjs/toolkit';
// import counterReducer from './counterSlice';
import projectFileReducer from './projectFileSlice';

export default configureStore({
  reducer: {
    // counter: counterReducer,
    projectFile: projectFileReducer,
  },
});
