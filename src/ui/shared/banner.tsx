import classNames from "classnames";

import { StatusVariant, variantToClassName } from "@app/status-variant";

import { IconAlertTriangle, IconCheck, IconInfo, IconRefresh } from "./icons";

const VariantIcon = ({ variant = "info" }: { variant: StatusVariant }) => {
  if (variant === "error") {
    return <IconAlertTriangle color="#fff" />;
  }

  if (variant === "warning") {
    return <IconAlertTriangle color="#fff" />;
  }

  if (variant === "success") {
    return <IconCheck color="#fff" />;
  }

  if (variant === "info") {
    return <IconInfo />;
  }

  if (variant === "progress") {
    return (
      <div className="animate-spin-slow 5s">
        <IconRefresh color="#FFF" />
      </div>
    );
  }

  return <IconInfo />;
};

export const Banner = ({
  children,
  className = "",
  variant = "info",
  showIcon = true,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: StatusVariant;
  showIcon?: boolean;
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
      {showIcon ? <div className="mr-2">
        <VariantIcon variant={variant} />
      </div> : null}
      <div>{children}</div>
    </div>
  );
};

export const BannerMessages = ({
  isSuccess,
  isError,
  isWarning,
  message,
  className,
}: {
  isSuccess: boolean;
  isError: boolean;
  isWarning?: boolean;
  message: string;
  className?: string;
}) => {
  if (!message) return null;

  if (isSuccess) {
    return (
      <Banner className={className} variant="success">
        {message}
      </Banner>
    );
  }

  if (isWarning) {
    return (
      <Banner className={className} variant="warning">
        {message}
      </Banner>
    );
  }

  if (isError) {
    return (
      <Banner className={className} variant="error">
        {message}
      </Banner>
    );
  }

  return null;
};
