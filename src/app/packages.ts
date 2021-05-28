import { createApp } from 'robodux';

import { AppState } from '@app/types';
import { api } from '@app/api';

const corePackages: any[] = [];

const packages = createApp<AppState>(corePackages);
export const rootReducer = packages.reducer;
export const rootSaga = api.saga();
