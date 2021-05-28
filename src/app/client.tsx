import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { fetchCurrentToken } from '@app/auth';

import { setupStore } from './store';
import { App } from './app';
import { rootSaga, rootReducer } from './packages';

export function init() {
  const { store } = setupStore({ rootSaga, rootReducer });
  (window as any).reduxStore = store;
  store.dispatch(fetchCurrentToken());

  render(
    <BrowserRouter>
      <App store={store} />
    </BrowserRouter>,
    document.getElementById('app'),
  );
}
