import React, { ReactNode, forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import classNames from 'classnames';
import {
  Box,
  Icon,
  PopoverMenu,
  Stack,
  Badge,
  BADGE_SIZE,
  ICON_TYPE,
  useMenuContext,
  Relative,
  Absolute,
} from '@aptible/arrow-ds';

export const popperModifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 4],
    },
  },
];

export interface TabsProps {
  children: ReactNode;
  onMouseLeave: () => void;
}

export interface TabProps {
  children: string;
  as?: any;
  isActive?: boolean;
  isCurrent?: boolean;
}

export interface TabMenuProps {
  tab: string;
  children: ReactNode;
  onToggle: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isOpen: boolean;
  isCurrent?: boolean;
  tabProps?: { [key: string]: any };
  menuProps?: { [key: string]: any };
}

export interface TabMenuItemProps {
  children: string;
  to: string;
  onClose: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  badge?: string;
}

export const NavTabs = ({ children, onMouseLeave }: TabsProps) => {
  return (
    <Stack
      onMouseLeave={onMouseLeave}
      className="h-full"
      role="navigation"
      as="nav"
    >
      {children}
    </Stack>
  );
};

export const NavTab = forwardRef<TabProps, any>(
  (
    {
      children,
      as: Component = RouterLink,
      isActive,
      isCurrent,
      ...rest
    }: TabProps,
    ref,
  ) => {
    return (
      <Component
        {...rest}
        ref={ref}
        className={classNames([
          'flex',
          'items-center',
          'h-appbar',
          'px-2',
          'text-white',
          'text-body',
          'ease-all-fast',
          'no-underline',
          'cursor-pointer',
          'relative',
          'focus:outline-none',
          'group',
        ])}
      >
        <Box
          as="span"
          className={classNames([
            'inline-flex',
            'items-center',
            'relative',
            'z-default',
          ])}
        >
          {children}
        </Box>
        <Box
          as="span"
          style={{
            height: 'calc(100% - 16px)',
          }}
          className={classNames(
            [
              'bg-transparent',
              'rounded',
              'absolute',
              'left-0',
              'top-0',
              'transition-colors',
              'ease-in-out',
              'duration-200',
              'w-full',
              'my-2',
              'group-hover:bg-lighten-300',
            ],
            isActive && ['bg-lighten-300'],
          )}
        />
        <Box
          as="span"
          className="block absolute bottom-0 left-0 w-full bg-brandGreen-400"
          style={{
            height: '3px',
            transform: isCurrent ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform .2s ease-in-out',
          }}
        />
      </Component>
    );
  },
);

export const NavTabMenu = ({
  tab,
  children,
  onToggle,
  onMouseEnter,
  onMouseLeave,
  isOpen,
  isCurrent,
  tabProps,
  menuProps,
}: TabMenuProps) => {
  return (
    <Relative
      className="z-menu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <NavTab
        as="button"
        type="button"
        isActive={isOpen}
        isCurrent={isCurrent}
        onClick={onToggle}
        {...tabProps}
      >
        <Box as="span">{tab}</Box>
        <Icon
          className="text-iconSm ml-2 text-gray-500"
          icon={ICON_TYPE.CHEVRON_DOWN}
        />
      </NavTab>
      {isOpen ? (
        <Absolute className="pt-1 pb-4 px-4 -ml-4">
          <PopoverMenu className="min-w-56" {...menuProps}>
            {children}
          </PopoverMenu>
        </Absolute>
      ) : null}
    </Relative>
  );
};

export const NavTabMenuItem = ({
  children,
  to,
  badge,
  onClose,
  isFirst,
  isLast,
  ...rest
}: TabMenuItemProps) => {
  const { itemProps } = useMenuContext();
  return (
    <RouterLink
      to={to}
      className={classNames([
        'text-gray-700',
        'text-h4',
        'font-medium',
        'p-3',
        'block',
        'transition-colors',
        'ease-in-out',
        'duration-200',
        'flex',
        'items-center',
        'hover:bg-gray-200',
        'focus:shadow-focus',
        'focus:outline-none',
        isFirst && 'rounded-t',
        isLast && 'rounded-b',
      ])}
      onClick={onClose}
      {...rest}
      {...itemProps}
    >
      <span className="whitespace-nowrap">{children}</span>
      {badge && (
        <Badge className="items-center ml-2" size={BADGE_SIZE.MICRO}>
          {badge}
        </Badge>
      )}
    </RouterLink>
  );
};
