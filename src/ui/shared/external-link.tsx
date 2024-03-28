import { StatusVariant } from "@app/status-variant";
import { ComponentProps } from "react";

const variantToLinks = (variant: StatusVariant): string => {
  switch (variant) {
    case "error":
      return "text-white underline";
    default:
      return "";
  }
};

export const ExternalLink = ({
  href,
  children,
  variant = "default",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}) => {
  const linkClasses = variantToLinks(variant);
  return (
    <a
      className={`${linkClasses} ${className}`}
      target="_blank"
      href={href}
      rel="noreferrer"
    >
      {children}
    </a>
  );
};

export const OptionalExternalLink = (
  props: ComponentProps<typeof ExternalLink> & { linkIf?: boolean },
) => {
  const { linkIf, children, ...rest } = props;

  return linkIf ? <ExternalLink {...rest}>{children}</ExternalLink> : children;
};
