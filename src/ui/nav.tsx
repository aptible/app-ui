import React from 'react';

import { Frame, PRODUCT_ID, Appbar } from '@aptible/arrow-ds';

import { defaultOrganization } from '@app/organizations';
import { homeUrl, securitySettingsUrl, sshSettingsUrl } from '@app/routes';
import { NavTabs, NavTab } from './nav-tab';
import { UserDropdown } from './user-nav';

export const Nav = ({ children }: { children: React.ReactNode }) => {
  const selectedOrg = defaultOrganization({ id: '1337', name: 'Aptible' });
  return (
    <Frame>
      <Frame.Area name="appbar">
        <Appbar
          logoProps={{ href: homeUrl() }}
          nav={
            <NavTabs onMouseLeave={() => {}}>
              <NavTab to={homeUrl()} isCurrent={true}>
                Dashboard
              </NavTab>
              <NavTab to={securitySettingsUrl()}>Security Settings</NavTab>
              <NavTab to={sshSettingsUrl()}>SSH Settings</NavTab>
            </NavTabs>
          }
          user={<UserDropdown />}
          organization={
            <Appbar.Organization name={selectedOrg.name} onClick={() => {}} />
          }
        />
      </Frame.Area>
      <Frame.Area name="main">{children}</Frame.Area>
    </Frame>
  );
};
