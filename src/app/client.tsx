import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { setupStore } from './store';
import { App } from './app';
import { rootSaga, rootReducer } from './packages';

export function init() {
  const { store } = setupStore({ rootSaga, rootReducer });
  (window as any).reduxStore = store;

  render(
    <BrowserRouter>
      <App store={store} />
    </BrowserRouter>,
    document.getElementById('app'),
  );
}
