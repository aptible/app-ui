import { createQuery, fetchBody, urlParser } from 'saga-query';

export const api = createQuery();
api.use(fetchBody);
api.use(urlParser);
