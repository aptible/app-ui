import { useParams } from 'react-router-dom';
import { useQuery } from 'saga-query/react';
import { useSelector } from 'react-redux';

import {
  fetchDatabase,
  hasDeployDatabase,
  selectDatabaseById,
} from '@app/deploy';
import { AppState, DeployDatabase } from '@app/types';

import { DetailPageSections } from '../../shared';

const DatabasePageContent = ({ database }: { database: DeployDatabase }) => (
  <DetailPageSections>
    <div>Database detail page ({database.handle})</div>
  </DetailPageSections>
);

export function DatabaseOverviewPage() {
  const { id = '' } = useParams();
  const { isInitialLoading, message } = useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  if (hasDeployDatabase(database)) {
    return <DatabasePageContent database={database} />;
  }

  if (isInitialLoading) return <span>Loading...</span>;
  return <span>{message || 'Something went wrong'}</span>;
}
