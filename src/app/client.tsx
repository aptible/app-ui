import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { bootup } from '@app/bootup';

import { setupStore } from './store';
import { App } from './app';
import { rootEntities } from './packages';

export function init() {
  const { store, persistor } = setupStore({
    initState: { entities: rootEntities },
  });
  (window as any).reduxStore = store;
  store.dispatch(bootup());

  render(
    <BrowserRouter>
      <PersistGate loading={null} persistor={persistor}>
        <App store={store} />
      </PersistGate>
    </BrowserRouter>,
    document.getElementById('app'),
  );
}
