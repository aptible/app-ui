import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import type { AppState } from '@app/types';
import { selectAppById } from '@app/deploy';

import { Button, DetailPageHeaderView, TabItem } from '../../shared';
import { AppContextMenu } from './app-context-menu';

const crumbs = [{ name: 'Apps', to: '/apps' }];

export function AppPageHeader() {
  const { id = '' } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

  const tabs = [
    { name: 'Overview', href: `/apps/${id}/overview` },
    { name: 'Activity', href: `/apps/${id}/activity` },
    { name: 'Security', href: `/apps/${id}/security` },
    { name: 'Settings', href: `/apps/${id}/security` },
  ] as TabItem[];

  const actions = [
    <AppContextMenu />,
    <Button variant="primary">Action</Button>,
  ];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      title={!app ? 'Loading...' : app.handle}
      actions={actions}
      tabs={tabs}
    />
  );
}
