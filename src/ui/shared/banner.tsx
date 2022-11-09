import classNames from "classnames";

import { StatusVariant, variantToColor } from "@app/status-variant";

export const Banner = ({
  children,
  className = "",
  variant = "info",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: StatusVariant;
}) => {
  const bg = variant === "default" ? "" : variantToColor(variant);
  return (
    <div className={classNames(bg, "rounded-md p-4 text-xs shadow", className)}>
      {children}
    </div>
  );
};
