import { StatusVariant, variantToTextColor } from '@app/status-variant';

export const InputFeedback = ({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: StatusVariant;
}) => {
  const color = variant === 'default' ? '' : variantToTextColor(variant);
  return <div className={`${color} text-xs`}>{children}</div>;
};
