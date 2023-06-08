import { Banner } from "./banner";
import { timeAgo } from "@app/date";
import { selectLatestOpByResourceId } from "@app/deploy";
import { operationDetailUrl } from "@app/routes";
import { StatusVariant } from "@app/status-variant";
import { capitalize } from "@app/string-utils";
import {
  AppState,
  OperationStatus,
  OperationType,
  ResourceType,
} from "@app/types";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BannerWrapper = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div className="m-4">{children}</div>;

const operationStatusToBannerStatus = (
  operationStatus: OperationStatus,
): StatusVariant => {
  if (operationStatus === "succeeded") {
    return "success";
  } else if (operationStatus === "failed") {
    return "error";
  } else if (operationStatus === "running" || operationStatus === "queued") {
    return "progress";
  }
  return "default";
};

export const ActiveOperationNotice = ({
  resourceId,
  resourceType,
  heartbeat,
}: {
  resourceId: string;
  resourceType: Extract<ResourceType, "app" | "database">;
  heartbeat?: Date;
}) => {
  const operation = useSelector((s: AppState) =>
    selectLatestOpByResourceId(s, { resourceId }),
  );
  const operationTypeAndStatusToDisplay: {
    [key in OperationType]?: OperationStatus[];
  } = {
    configure: ["failed", "running", "queued"],
    deploy: ["failed", "running", "queued"],
    deprovision: ["failed", "running", "queued", "succeeded"],
    provision: ["failed", "running", "queued"],
  };

  if (!operation) {
    return null;
  }

  if (
    !operationTypeAndStatusToDisplay[operation.type]?.includes(operation.status)
  ) {
    return null;
  }

  const gerundOfOpType =
    operation.type === "configure" ? "configuring" : `${operation.type}ing`;

  if (["failed", "succeeded"].includes(operation.status)) {
    return (
      <BannerWrapper>
        <Banner variant={operationStatusToBannerStatus(operation.status)}>
          <p>
            {capitalize(operation.status)} {gerundOfOpType}{" "}
            <b>{resourceType}</b> ({timeAgo(operation.createdAt)}) -{" "}
            <Link
              className="text-white underline"
              to={operationDetailUrl(operation.id)}
            >
              View operation
            </Link>
          </p>
        </Banner>
      </BannerWrapper>
    );
  }

  if (["running", "queued"].includes(operation.status)) {
    return (
      <BannerWrapper>
        <Banner variant={operationStatusToBannerStatus(operation.status)}>
          <p>
            {capitalize(operation.type)}ing <b>{resourceType}</b> (
            {timeAgo(operation.createdAt)}) -{" "}
            <Link
              className="text-white underline"
              to={operationDetailUrl(operation.id)}
            >
              View operation
            </Link>
          </p>
        </Banner>
      </BannerWrapper>
    );
  }

  // return null
  return null;
};
