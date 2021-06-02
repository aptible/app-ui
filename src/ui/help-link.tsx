import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import classNames from 'classnames';

import { Link, LinkProps } from '@aptible/arrow-ds';

export const HelpLink = ({
  children,
  className,
  as = RouterLink,
  ...rest
}: LinkProps) => {
  return (
    <Link
      as={as}
      className={classNames(
        'text-brandGreen-400',
        'no-underline',
        'focus:underline',
        'focus:text-gold-400',
        'hover:underline',
        'hover:text-gold-400',
        'leading-normal',
        className,
      )}
      style={{ letterSpacing: '0.02em' }}
      {...rest}
    >
      {children}
    </Link>
  );
};
