import classNames from "classnames";

import { IconAlertTriangle, IconInfo } from "./icons";
import { StatusVariant, variantToClassName } from "@app/status-variant";

export const Banner = ({
  children,
  className = "",
  variant = "info",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: StatusVariant;
}) => {
  const classes = variantToClassName(variant);

  return (
    <div
      role="status"
      className={classNames(
        classes,
        "rounded-md px-6 py-3 shadow flex items-center",
        className,
      )}
    >
      <div className="mr-2">
        {variant === "info" ? <IconInfo /> : <IconAlertTriangle color="#fff" />}
      </div>
      <div>{children}</div>
    </div>
  );
};
