import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';

import { AppState } from '@app/types';

import { Router } from './router';

export const App = ({ store }: { store: Store<AppState> }) => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <Router />
      </Provider>
    </React.StrictMode>
  );
};
