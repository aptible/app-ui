import { SagaIterator } from 'redux-saga';

export type ApiGen<RT = void> = SagaIterator<RT>;
