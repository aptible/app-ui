import { defaultEntity } from '@app/hal';

import { addUsers } from './slice';
import { deserializeUser } from './serializers';

export * from './slice';
export * from './serializers';
export * from './selectors';
export * from './types';
export * from './effects';
export * from './constants';

export const entities = {
  user: defaultEntity({
    id: 'user',
    save: addUsers,
    deserialize: deserializeUser,
  }),
};
