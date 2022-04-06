import {
  StatusVariant,
  variantToColor,
  variantToHoverColor,
} from '@app/status-variant';

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
  className = '',
  ...args
}: Props) => {
  const bg = variantToColor(variant);
  const bgHover = variantToHoverColor(variant);
  return (
    <button
      className={`${bg} ${bgHover} text-white px-2 shadow-md rounded py-2 text-center transition disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...args}
    >
      {isLoading ? 'Loading ...' : children}
    </button>
  );
};
