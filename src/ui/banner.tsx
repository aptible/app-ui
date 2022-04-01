import classNames from 'classnames';

import { StatusVariant, variantToColor } from '@app/status-variant';

export const Banner = ({
  children,
  className = '',
  variant = 'info',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: StatusVariant;
}) => {
  const bg = variant === 'default' ? '' : `bg-${variantToColor(variant)}-100`;
  return <div className={classNames(className, bg)}>{children}</div>;
};
