import { IconCheck, IconInfo, IconSettings, IconX } from "./icons";
import { prettyDateRelative } from "@app/date";
import { OperationStatus } from "@app/types";
import cn from "classnames";

export const Pill = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: JSX.Element;
}) => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold text-black-500",
    "ml-2 px-2 flex justify-between items-center w-fit",
  );
  return (
    <div className={className}>
      {icon}
      <div className="ml-1">{children}</div>
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
  const date = prettyDateRelative(from);

  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  if (status === "running" || status === "queued") {
    return (
      <div
        className={cn(className, "text-brown border-brown bg-orange-100")}
        role="status"
      >
        <IconSettings color="#825804" className="mr-1" variant="sm" />
        <div>
          {status === "running" ? "Building" : "Queued"} {date}
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className={cn(className, "text-red border-red-300 bg-red-100")}
        role="status"
      >
        <IconX color="#AD1A1A" variant="sm" />
        <div>Failed {date}</div>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div
        className={cn(className, "text-forest border-lime-300 bg-lime-100")}
        role="status"
      >
        <IconCheck color="#00633F" className="mr-1" variant="sm" />
        Deployed {date}
      </div>
    );
  }

  return (
    <div
      className={cn(className, "text-indigo border-indigo-300 bg-indigo-100")}
      role="status"
    >
      <IconInfo color="#4361FF" className="mr-1" variant="sm" />
      Not deployed
    </div>
  );
};
