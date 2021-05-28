import { createApp } from 'robodux';

import { AppState } from '@app/types';
import { api } from '@app/api';
import * as env from '@app/env';

const corePackages: any[] = [env];

const packages = createApp<AppState>(corePackages);
export const rootReducer = packages.reducer;
export const rootSaga = api.saga();
