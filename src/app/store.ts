import {
  createStore,
  applyMiddleware,
  Middleware,
  Store,
  Reducer,
  AnyAction,
} from 'redux';
import createSagaMiddleware, { Saga, stdChannel } from 'redux-saga';
import { enableBatching, BATCH } from 'redux-batched-actions';
import { Action } from 'robodux';
import { PersistPartial } from 'redux-persist/es/persistReducer';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import { AppState } from '@app/types';
import { resetReducer } from '@app/reset-store';

interface Props {
  initState?: Partial<AppState>;
  rootReducer: Reducer<AppState, AnyAction>;
  rootSaga: Saga<any>;
}

interface AppStore<State> {
  store: Store<State>;
  persistor: any;
}

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [],
};

export function setupStore({
  initState,
  rootReducer,
  rootSaga,
}: Props): AppStore<AppState> {
  const middleware: Middleware[] = [];

  const channel = stdChannel();
  const rawPut = channel.put;
  channel.put = (action: Action<any>) => {
    if (action.type === BATCH) {
      action.payload.forEach(rawPut);
      return;
    }
    rawPut(action);
  };

  const sagaMiddleware = createSagaMiddleware({ channel } as any);
  middleware.push(sagaMiddleware);

  if (import.meta.env.DEV) {
    const logger = (store: any) => (next: any) => (action: any) => {
      if (action.type === BATCH) {
        console.log('== BATCH ==');
        action.payload.forEach(console.log);
        console.log('== END BATCH ==');
      } else {
        console.log('ACTION', action);
      }
      next(action);
      console.log('NEXT STATE', store.getState());
    };
    middleware.push(logger);
  }

  // we need this baseReducer so we can wipe the localStorage cache as well as
  // reset the store when a user logs out
  const baseReducer = resetReducer(rootReducer, persistConfig);
  const persistedReducer = enableBatching(
    persistReducer(persistConfig, baseReducer),
  );

  const store = createStore(
    persistedReducer,
    initState as AppState & PersistPartial,
    applyMiddleware(...middleware),
  );
  const persistor = persistStore(store);

  sagaMiddleware.run(rootSaga);

  return { store, persistor };
}
