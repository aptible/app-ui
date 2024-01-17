import { IconProps, IconRefresh } from "./icons";

export interface LoadingSpinnerProps extends IconProps {
  show?: boolean;
}

export const Loading = ({
  className = "",
  text = "loading...",
  isLoading = true,
}: {
  className?: string;
  text?: string;
  isLoading?: boolean;
}) => {
  return isLoading ? <div className={className}>{text}</div> : null;
};

export const LoadingSpinner = ({
  color = "#111920",
  show = true,
  variant = "sm",
}: LoadingSpinnerProps) => {
  return show ? (
    <div className="animate-spin-slow 5s">
      <IconRefresh color={color} variant={variant} />
    </div>
  ) : null;
};
