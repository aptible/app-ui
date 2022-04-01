import { useSelector, useDispatch } from 'react-redux';

import { selectJWTToken } from '@app/token';
import { logout } from '@app/auth';
import { defaultOrganization } from '@app/organizations';
import { securitySettingsUrl, sshSettingsUrl } from '@app/routes';

interface DropdownLink {
  label: string;
  to: string;
  isExternal: boolean;
}

export const UserDropdown = () => {
  const user = useSelector(selectJWTToken);
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
    <div>
      name: {user.name}
      email: {user.email}
      <button onClick={() => dispatch(logout())}>logout</button>
    </div>
  );
};
