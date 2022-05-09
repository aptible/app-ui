import { Outlet } from 'react-router-dom';

import { SettingsPageLayout } from '../../layouts';

export function SettingsPage() {
  return (
    <SettingsPageLayout>
      <Outlet />
    </SettingsPageLayout>
  );
}
