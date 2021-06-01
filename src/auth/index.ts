import { api } from '@app/api';

export const fetchCurrentToken = api.get(
  '/current_token',
  api.request({ endpoint: 'auth' }),
);
