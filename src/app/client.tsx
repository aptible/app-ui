import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { fetchCurrentToken } from '@app/token-api';

import { setupStore } from './store';
import { App } from './app';
import { rootSaga, rootReducer, rootEntities } from './packages';

export function init() {
  const { store, persistor } = setupStore({
    rootSaga,
    rootReducer,
    initState: { entities: rootEntities },
  });
  (window as any).reduxStore = store;
  store.dispatch(fetchCurrentToken());

  render(
    <BrowserRouter>
      <PersistGate loading={null} persistor={persistor}>
        <App store={store} />
      </PersistGate>
    </BrowserRouter>,
    document.getElementById('app'),
  );
}
