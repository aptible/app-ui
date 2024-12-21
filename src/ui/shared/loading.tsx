import type { IconProps } from "./icons";

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

export const LoadingSpinner = () => (
  <svg
    role="img"
    aria-label="loading spinner"
    className="animate-spin h-[20px] w-[20px] text-gray-500"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
