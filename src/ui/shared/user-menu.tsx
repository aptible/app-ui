import cn from 'classnames';
import { ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/solid';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { selectTheme, setTheme } from '@app/theme';
import { Theme } from '@app/types';
import { logoutUrl, securitySettingsUrl, sshSettingsUrl } from '@app/routes';

import { useCurrentUser } from '../use-current-user';

import { tokens } from './tokens';
import { Menu, MenuButton, MenuList, MenuItem } from './menu-button';

interface ToggleTheme {
  value: Theme;
  icon: JSX.Element;
}

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const navigate = useNavigate();

  const toggle: ToggleTheme =
    theme === 'dark'
      ? { value: 'light', icon: <SunIcon /> }
      : { value: 'dark', icon: <MoonIcon /> };

  if (isLoading || !user) {
    return <>Loading...</>;
  }

  return (
    <Menu>
      <MenuButton>
        <div className="flex-1">{user.name}</div>
        <ChevronDownIcon className={cn(tokens.type.normal, 'w-4')} />
      </MenuButton>
      <MenuList>
        <div className="px-4 py-2">
          <p className={tokens.type['small semibold darker']}>{user.name}</p>
          <p className={tokens.type['small lighter']}>{user.email}</p>
        </div>
        <MenuItem onSelect={() => dispatch(setTheme(toggle.value))}>
          Enable {toggle.value} theme
        </MenuItem>
        <MenuItem onSelect={() => navigate(sshSettingsUrl())}>
          SSH Keys
        </MenuItem>
        <MenuItem onSelect={() => navigate(securitySettingsUrl())}>
          Security Settings
        </MenuItem>
        <MenuItem onSelect={() => navigate(logoutUrl())}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};
