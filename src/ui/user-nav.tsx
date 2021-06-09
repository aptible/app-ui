import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Appbar } from '@aptible/arrow-ds';

import { selectCurrentUser } from '@app/users';
import { logout } from '@app/auth';
import { defaultOrganization } from '@app/organizations';
import { securitySettingsUrl, sshSettingsUrl } from '@app/routes';
// import { selectOrganizationSelected } from '@comply/organizations';

import { UserAvatar } from './user-avatar';

interface DropdownLink {
  label: string;
  to: string;
  isExternal: boolean;
}

export const UserDropdown = () => {
  const user = useSelector(selectCurrentUser);
  const selectedOrg = defaultOrganization({ id: '1337', name: 'Aptible' });
  const dispatch = useDispatch();
  const isOwner = true;

  const items: DropdownLink[] = [];

  items.push(
    {
      label: 'Security Settings',
      to: securitySettingsUrl(),
      isExternal: false,
    },
    {
      label: 'SSH Settings',
      to: sshSettingsUrl(),
      isExternal: false,
    },
    {
      label: 'Help Center',
      to: 'https://docs.aptible.com',
      isExternal: true,
    },
    {
      label: 'Open a Support Ticket',
      to: 'https://aptible.zendesk.com/hc/en-us/requests/new',
      isExternal: true,
    },
  );

  if (isOwner) {
    items.push({
      label: 'Billing',
      to: `/organizations/${selectedOrg.id}/admin/billing`,
      isExternal: false,
    });
  }

  return (
    <Appbar.UserDropdown
      name={user.name}
      avatar={
        <UserAvatar
          size="large"
          name={user.name}
          email={user.email}
          className="mr-2 flex-shrink-0"
          enableTooltip={false}
          square
        />
      }
    >
      <Appbar.UserDropdownMenu>
        {items.map(({ to, label, isExternal }) => {
          if (isExternal) {
            return (
              <Appbar.UserDropdownMenuItem
                key={label}
                href={to}
                target="_blank"
              >
                {label}
              </Appbar.UserDropdownMenuItem>
            );
          }
          return (
            <Appbar.UserDropdownMenuItem as={RouterLink} key={label} to={to}>
              {label}
            </Appbar.UserDropdownMenuItem>
          );
        })}
        <Appbar.UserDropdownMenuItem
          onClick={() => dispatch(logout())}
          as="button"
        >
          Logout
        </Appbar.UserDropdownMenuItem>
      </Appbar.UserDropdownMenu>
    </Appbar.UserDropdown>
  );
};
