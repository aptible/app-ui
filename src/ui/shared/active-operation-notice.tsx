import { prettyDateTime } from "@app/date";
import { selectLatestOpByResourceId } from "@app/deploy";
import { useSelector } from "@app/react";
import { operationDetailUrl } from "@app/routes";
import type { WebState } from "@app/schema";
import type { StatusVariant } from "@app/status-variant";
import { capitalize } from "@app/string-utils";
import type { OperationStatus, OperationType, ResourceType } from "@app/types";
import { Link } from "react-router-dom";
import { Banner } from "./banner";

const BannerWrapper = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div className="mb-4">{children}</div>;

const operationStatusToBannerStatus = (
  operationStatus: OperationStatus,
): StatusVariant => {
  if (operationStatus === "succeeded") {
    return "success";
  }
  if (operationStatus === "failed") {
    return "error";
  }
  if (operationStatus === "running" || operationStatus === "queued") {
    return "progress";
  }
  return "default";
};

export const ActiveOperationNotice = ({
  resourceId,
  resourceType,
}: {
  resourceId: string;
  resourceType: Extract<ResourceType, "app" | "database">;
}) => {
  const operation = useSelector((s: WebState) =>
    selectLatestOpByResourceId(s, { resourceId, resourceType }),
  );
  const operationTypeAndStatusToDisplay: {
    [key in OperationType]?: OperationStatus[];
  } = {
    configure: ["failed", "running", "queued"],
    deploy: ["failed", "running", "queued"],
    deprovision: ["failed", "running", "queued", "succeeded"],
    provision: ["failed", "running", "queued"],
    restart: ["failed", "running", "queued"],
    scale: ["failed", "running", "queued"],
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
            <b>{resourceType}</b> ({prettyDateTime(operation.createdAt)}) -{" "}
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
            {capitalize(gerundOfOpType)} <b>{resourceType}</b> (
            {prettyDateTime(operation.createdAt)}) -{" "}
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
