import {
  Menu as ReachMenu,
  MenuProps,
  MenuList as ReachMenuList,
  MenuListProps,
  MenuButton as ReachMenuButton,
  MenuButtonProps,
  MenuItem as ReachMenuItem,
  MenuItemProps,
  MenuItems as ReachMenuItems,
  MenuItemsProps,
  MenuPopover as ReachMenuPopover,
  MenuPopoverProps,
  MenuLink as ReachMenuLink,
  MenuLinkProps,
} from '@reach/menu-button';

import './menu.css';
import { tokens } from './tokens';

import cn from 'classnames';
import { Size } from './button';

export const Menu = (props: MenuProps) => (
  <ReachMenu className={cn()} {...props} />
);
export const MenuList = (props: MenuListProps) => (
  <ReachMenuList className={''} {...props} />
);
export const MenuButton = (props: MenuButtonProps & { size?: Size }) => {
  const { size = 'md' } = props;
  const classes = cn(
    tokens.buttons.sizes[size],
    tokens.buttons.styles.white,
    'rounded-md',
    'items-center flex gap-2 text-left w-full',
  );
  return <ReachMenuButton className={classes} {...props} />;
};

export const MenuPopover = (props: MenuPopoverProps) => (
  <ReachMenuPopover className={''} {...props} />
);
export const MenuItem = (props: MenuItemProps) => (
  <ReachMenuItem
    className={cn(tokens.type['small normal'], 'px-4 py-2')}
    {...props}
  />
);
export const MenuItems = (props: MenuItemsProps) => (
  <ReachMenuItems className={''} {...props} />
);
export const MenuLink = (props: MenuLinkProps) => (
  <ReachMenuLink className={''} {...props} />
);
