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

import { AppState } from '@app/types';

interface Props {
  initState?: Partial<AppState>;
  rootReducer: Reducer<AppState, AnyAction>;
  rootSaga: Saga<any>;
}

interface AppStore<State> {
  store: Store<State>;
}

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

  const store = createStore(
    enableBatching(rootReducer),
    initState as AppState,
    applyMiddleware(...middleware),
  );

  sagaMiddleware.run(rootSaga);

  return { store };
}
