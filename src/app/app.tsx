import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import type { Store } from '@reduxjs/toolkit';

import type { AppState } from '@app/types';

import { Router } from './router';

export const App = ({ store }: { store: Store<AppState> }) => {
  return (
    <StrictMode>
      <Provider store={store}>
        <Router />
      </Provider>
    </StrictMode>
  );
};
