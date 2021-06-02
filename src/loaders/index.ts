import { createLoaderTable } from 'robodux';

import { AppState } from '@app/types';

export enum Loaders {
  Auth = 'auth',
}

export const LOADERS_NAME = 'loaders';
const loaders = createLoaderTable({ name: LOADERS_NAME });
export const { selectById: selectLoaderById } = loaders.getSelectors(
  (s: AppState) => s[LOADERS_NAME],
);
