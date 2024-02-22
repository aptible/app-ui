import { IconProps } from "./icons";

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

export const LoadingSpinner = ({ show = true }: LoadingSpinnerProps) => {
  if (!show) return null;
  return (
    <img
      alt="Fetching data in the background"
      src="/loader.png"
      className="w-[20px] h-[20px] animate-spin"
    />
  );
};
