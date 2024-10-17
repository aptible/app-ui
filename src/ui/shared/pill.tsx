import { prettyDate } from "@app/date";
import type { OperationStatus } from "@app/types";
import cn from "classnames";
import { IconCheck, IconInfo, IconSettings, IconX } from "./icons";

// TODO: Add support for StatusVariant | "pending"
export type PillVariant =
  | "default"
  | "pending"
  | "progress"
  | "success"
  | "error";

const pillStyles = {
  pending: "text-brown border-brown bg-orange-100",
  error: "text-red border-red-300 bg-red-100",
  progress: "text-indigo border-indigo-300 bg-indigo-100",
  success: "text-forest border-lime-300 bg-lime-100",
};

const variantToClassName = (variant: PillVariant) => {
  switch (variant) {
    case "pending":
      return pillStyles.pending;
    case "progress":
      return pillStyles.progress;
    case "success":
      return pillStyles.success;
    case "error":
      return pillStyles.error;
    default:
      return "";
  }
};

export const Pill = ({
  children,
  className = "",
  variant = "default",
  icon = null,
  title = "",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: PillVariant;
  icon?: React.ReactNode;
  title?: string;
}) => {
  const defaultClassName = cn(
    "rounded-full border-2",
    "text-sm font-semibold text-black-500",
    "px-2 flex gap-1 justify-between items-center w-fit",
    variantToClassName(variant),
  );
  return (
    <div className={`${defaultClassName} ${className}`}>
      {icon}
      <div title={title}>{children}</div>
    </div>
  );
};

export const StatusPill = ({
  status,
  from,
}: {
  status: OperationStatus;
  from: string;
}) => {
  const date = prettyDate(from);

  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  if (status === "running" || status === "queued") {
    return (
      <div className={cn(className, pillStyles.pending)} role="status">
        <IconSettings color="#825804" className="mr-1" variant="sm" />
        <div>
          {status === "running" ? "Building" : "Queued"} {date}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={cn(className, pillStyles.error)} role="status">
        <IconX color="#AD1A1A" variant="sm" />
        <div>Failed {date}</div>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className={cn(className, pillStyles.success)} role="status">
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
        Deployed {date}
      </div>
    );
  }

  return (
    <div className={cn(className, pillStyles.progress)} role="status">
      <IconInfo color="#4361FF" className="mr-1" variant="sm" />
      Not deployed
    </div>
  );
};
