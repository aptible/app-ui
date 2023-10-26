export const Group = ({
  children,
  className = "",
  variant = "vertical",
  size = "lg",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "horizontal" | "vertical";
  size?: "xs" | "sm" | "lg";
}) => {
  const orient = variant === "vertical" ? "flex-col" : "flex-row";
  const gap = () => {
    if (size === "xs") return "gap-0.5";
    if (size === "sm") return "gap-2";
    return "gap-4";
  };
  return (
    <div className={`flex ${gap()} ${orient} ${className}`}>{children}</div>
  );
};
