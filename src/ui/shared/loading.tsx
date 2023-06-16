export const Loading = ({
  className = "",
  text = "loading...",
}: {
  className?: string;
  text?: string;
}) => {
  return <div className={className}>{text}</div>;
};
