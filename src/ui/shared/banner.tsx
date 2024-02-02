import { useSelector } from "@app/react";
import { homeUrl } from "@app/routes";
import { StatusVariant, variantToClassName } from "@app/status-variant";
import { selectIsUserAuthenticated } from "@app/token";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { IconAlertTriangle, IconCheck, IconInfo } from "./icons";
import { LoadingSpinner } from "./loading";

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
    return <LoadingSpinner color="#fff" variant="base" />;
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
      {showIcon ? (
        <div className="mr-2">
          <VariantIcon variant={variant} />
        </div>
      ) : null}
      <div>{children}</div>
    </div>
  );
};

export const BannerMessagesBasic = ({
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
  if (!message) return null;

  if (isSuccess) {
    return (
      <div className={`flex items-center text-green-300 ${className}`}>
        <IconCheck color="#4D9279" />
        {message}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`flex items-center text-red-300 ${className}`}>
        <IconAlertTriangle color="#C76464" />
        {message}
      </div>
    );
  }

  return null;
};

export const BannerMessages = ({
  isSuccess,
  isError,
  isWarning,
  message,
  className,
  meta
}: {
  isSuccess: boolean;
  isError: boolean;
  isWarning?: boolean;
  message: string;
  className?: string;
  meta?: any
}) => {
  if (!message) return null;

  if (isSuccess || meta.fakeTrue) {
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

export const AlreadyAuthenticatedBanner = () => {
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  return isAuthenticated ? (
    <Banner variant="success">
      You are already logged in!{" "}
      <Link to={homeUrl()} className="text-white underline">
        Continue to dashboard
      </Link>
    </Banner>
  ) : null;
};
