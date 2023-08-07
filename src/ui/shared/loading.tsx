import { IconRefresh } from "./icons";

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
}: { color?: string; show?: boolean }) => {
  return show ? (
    <div className="animate-spin-slow 5s">
      <IconRefresh color={color} variant="sm" />
    </div>
  ) : null;
};
