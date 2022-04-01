import { REHYDRATE } from 'redux-persist';
import { createAction } from 'robodux';
import { call, takeEvery, take } from 'saga-query';

import { fetchCurrentToken } from '@app/auth';

export const bootup = createAction('BOOTUP');
function* onBootup() {
  // wait for redux-persist to rehydrate redux store
  yield take(REHYDRATE);
  yield call(fetchCurrentToken.run, fetchCurrentToken());
}

function* watchBootup() {
  yield takeEvery(`${bootup}`, onBootup);
}

export const sagas = { watchBootup };
