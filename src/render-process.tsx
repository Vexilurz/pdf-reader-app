import * as DOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';
import App from './App';
import store from './reduxStore/store';

DOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
