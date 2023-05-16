import classNames from "classnames";

import { StatusVariant, variantToClassName } from "@app/status-variant";

import { IconAlertTriangle, IconCheck, IconInfo } from "./icons";

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

export const BannerMessages = ({
  isSuccess,
  isError,
  message,
  className,
}: {
  isSuccess: boolean;
  isError: boolean;
  message: string;
  className?: string;
}) => {
  if (isSuccess) {
    return (
      <Banner className={className} variant="success">
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
