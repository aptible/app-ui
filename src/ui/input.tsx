import { StatusVariant, variantToColor } from '@app/status-variant';

export const InputFeedback = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: StatusVariant;
}) => {
  const bg = variant === 'default' ? '' : `bg-${variantToColor(variant)}-100`;
  return <div className={bg}>{children}</div>;
};
