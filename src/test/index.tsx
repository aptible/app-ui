import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import { prepareStore } from 'saga-query';

import type { AppState } from '@app/types';
import { reducers, sagas } from '@app/app';

export const setupIntegrationTest = (initState: Partial<AppState> = {}, path = '') => {
  const prepared = prepareStore({ reducers, sagas });

  const store = createStore(
    prepared.reducer,
    initState as AppState,
    applyMiddleware(...prepared.middleware),
  );
  prepared.run();

  const TestProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <MemoryRouter>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };
  return { store, TestProvider, history };
};
