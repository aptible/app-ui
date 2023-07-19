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
