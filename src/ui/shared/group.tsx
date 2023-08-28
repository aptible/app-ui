export const Group = ({
  children,
  className = "",
  variant = "vertical",
  size = "lg",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "horizontal" | "vertical";
  size?: "sm" | "lg";
}) => {
  const orient = variant === "vertical" ? "flex-col" : "flex-row";
  const gap = size === "lg" ? "gap-4" : "gap-2";
  return <div className={`flex ${gap} ${orient} ${className}`}>{children}</div>;
};
