import { Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import type { AppState } from '@app/types';
import { selectDatabaseById } from '@app/deploy';
import { databasesUrl } from '@app/routes';

import { DetailPageHeaderView, TabItem, DatabaseContextMenu } from '../shared';

import { DetailPageLayout } from './detail-page';

const crumbs = [{ name: 'Databases', to: databasesUrl() }];

function DatabasePageHeader() {
  const { id = '' } = useParams();
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  const tabs = [
    { name: 'Overview', href: `/databases/${id}/overview` },
    { name: 'Activity', href: `/databases/${id}/activity` },
    { name: 'Security', href: `/databases/${id}/security` },
    { name: 'Backups', href: `/databases/${id}/backups` },
    { name: 'Settings', href: `/databases/${id}/settings` },
  ] as TabItem[];

  const actions = [<DatabaseContextMenu />];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={!database ? 'Loading...' : database.handle}
      actions={actions}
      tabs={tabs}
    />
  );
}

export const DatabaseDetailLayout = () => {
  return (
    <DetailPageLayout header={<DatabasePageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
