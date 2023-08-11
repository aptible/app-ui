import { IconCheck, IconInfo, IconSettings, IconX } from "./icons";
import { prettyDateRelative } from "@app/date";
import { OperationStatus } from "@app/types";
import cn from "classnames";

export const Pill = ({
  children,
  className = "",
  icon = null,
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) => {
  const defaultClassName = cn(
    "rounded-full border-2",
    "text-sm font-semibold text-black-500",
    "px-2 flex gap-2 justify-between items-center w-fit",
  );
  return (
    <div className={`${defaultClassName} ${className}`}>
      {icon}
      <div>{children}</div>
    </div>
  );
};

export const pillStyles = {
  pending: "text-brown border-brown bg-orange-100",
  error: "text-red border-red-300 bg-red-100",
  progress: "text-indigo border-indigo-300 bg-indigo-100",
  success: "text-forest border-lime-300 bg-lime-100",
};

export const StatusPill = ({
  status,
  from,
}: {
  status: OperationStatus;
  from: string;
}) => {
  const date = prettyDateRelative(from);

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
