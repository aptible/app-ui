import { Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import type { AppState } from '@app/types';
import { selectAppById } from '@app/deploy';
import {
  appActivityUrl,
  appDetailUrl,
  appSecurityUrl,
  appSettingsUrl,
  appsUrl,
} from '@app/routes';

import { DetailPageHeaderView, TabItem, AppContextMenu } from '../shared';

import { DetailPageLayout } from './detail-page';

const crumbs = [{ name: 'Apps', to: appsUrl() }];

function AppPageHeader() {
  const { id = '' } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  const tabs = [
    { name: 'Overview', href: appDetailUrl(id) },
    { name: 'Activity', href: appActivityUrl(id) },
    { name: 'Security', href: appSecurityUrl(id) },
    { name: 'Settings', href: appSettingsUrl(id) },
  ] as TabItem[];

  const actions = [<AppContextMenu />];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={!app ? 'Loading...' : app.handle}
      actions={actions}
      tabs={tabs}
    />
  );
}

export const AppDetailLayout = () => {
  return (
    <DetailPageLayout header={<AppPageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
