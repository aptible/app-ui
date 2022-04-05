import { REHYDRATE } from 'redux-persist';
import { call, take } from 'saga-query';

import { fetchCurrentToken } from '@app/auth';
import { thunks } from '@app/api';

export const bootup = thunks.create('bootup', function* onBootup(_, next) {
  // wait for redux-persist to rehydrate redux store
  yield take(REHYDRATE);
  yield call(fetchCurrentToken.run, fetchCurrentToken());
  yield next();
});
