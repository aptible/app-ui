import { useParams } from 'react-router-dom';
import { useQuery } from 'saga-query/react';
import { useSelector } from 'react-redux';

import { fetchApp, hasDeployApp, selectAppById } from '@app/deploy';
import { AppState, DeployApp } from '@app/types';

import { DetailPageSections } from '../../shared';

import { ServicesOverview } from './services-detail';
import { AppEndpointsOverview } from './endpoints-detail';

const AppPageContent = ({ app }: { app: DeployApp }) => (
  <DetailPageSections>
    <ServicesOverview app={app} />
    <AppEndpointsOverview app={app} />
  </DetailPageSections>
);

export function AppOverviewPage() {
  const { id = '' } = useParams();
  const { isInitialLoading, message } = useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  if (hasDeployApp(app)) {
    return <AppPageContent app={app} />;
  }

  if (isInitialLoading) return <span>Loading...</span>;
  return <span>{message || 'Something went wrong'}</span>;
}
