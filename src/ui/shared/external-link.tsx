import { StatusVariant } from "@app/status-variant";

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
  variant,
}: {
  href: string;
  children: React.ReactNode;
  variant: StatusVariant;
}) => {
  const className = variantToLinks(variant);
  return (
    <a className={className} target="_blank" href={href} rel="noreferrer">
      {children}
    </a>
  );
};
