import { useSelector } from 'react-redux';
import { useQuery } from 'saga-query/react';

import { fetchDatabases, selectDatabasesAsList } from '@app/deploy';

import { DatabaseListView } from './database-list-view';

export function DatabaseList() {
  const { isInitialLoading, isError, message } = useQuery(fetchDatabases());
  const databases = useSelector(selectDatabasesAsList);

  if (isInitialLoading) return <span>Loading ...</span>;
  if (isError && message) return <span>{message}</span>;
  if (databases.length === 0) return <span>No databases found.</span>;

  return <DatabaseListView databases={databases} />;
}
