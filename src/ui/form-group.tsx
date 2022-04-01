import { StatusVariant, variantToColor } from '@app/status-variant';
import classNames from 'classnames';

export const FormGroup = ({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: StatusVariant;
}) => {
  const bg = variant === 'default' ? '' : `bg-${variantToColor(variant)}-100`;
  return <div className={classNames(className, bg)}>{children}</div>;
};
