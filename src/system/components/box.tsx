import React, { HTMLAttributes, forwardRef } from 'react';

export interface BoxProps extends HTMLAttributes<HTMLDivElement> {
  ref?: any;
  as?: any;
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  ({ as: Component = 'div', ...rest }, ref) => {
    return <Component ref={ref} {...rest} />;
  },
);
