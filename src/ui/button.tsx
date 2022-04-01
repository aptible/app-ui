import { StatusVariant, variantToColor } from '@app/status-variant';

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isLoading?: boolean;
  variant?: StatusVariant;
}

export const Button = ({
  children,
  isLoading = false,
  variant = 'default',
  ...args
}: Props) => {
  const bg = variant === 'default' ? '' : `bg-${variantToColor(variant)}-100`;
  return (
    <button className={bg} {...args}>
      {isLoading ? 'Loading ...' : children}
    </button>
  );
};
