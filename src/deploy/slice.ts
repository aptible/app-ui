import type { AppState } from '@app/types';

export const DEPLOY_NAME = 'deploy';
export const selectDeploy = (s: AppState) => s[DEPLOY_NAME];
