import classNames from "classnames";

import { StatusVariant, variantToClassName } from "@app/status-variant";

import { IconAlertTriangle, IconCheckCircle, IconInfo } from "./icons";

const VariantIcon = ({ variant = "info" }: { variant: StatusVariant }) => {
  if (variant === "error") {
    return <IconAlertTriangle color="#fff" />;
  }

  if (variant === "warning") {
    return <IconAlertTriangle color="#fff" />;
  }

  if (variant === "success") {
    return <IconCheckCircle />;
  }

  if (variant === "info") {
    return <IconInfo />;
  }

  return <IconInfo />;
};

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
        <VariantIcon variant={variant} />
      </div>
      <div>{children}</div>
    </div>
  );
};
