import { Outlet } from 'react-router-dom';

import { DetailPageLayout } from '../../layouts';

import { AppPageHeader } from './app-page-header';

export const AppPage = () => {
  return (
    <DetailPageLayout header={<AppPageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
