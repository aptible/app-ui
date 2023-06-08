import { Banner } from "./banner";
import { IconRefresh } from "./icons";
import { timeAgo } from "@app/date";
import { selectLatestOpByAppId, selectLatestOpByDatabaseId } from "@app/deploy";
import { operationDetailUrl } from "@app/routes";
import { StatusVariant } from "@app/status-variant";
import { capitalize } from "@app/string-utils";
import { AppState, ResourceType } from "@app/types";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BannerWrapper = ({
  children,
}: {
  children?: React.ReactNode;
}) => <div className="m-4">{children}</div>;

export const ActiveOperationNotice = ({
  resourceId,
  resourceType,
  heartbeat,
}: {
  resourceId: string;
  resourceType: Extract<ResourceType, "app" | "database">;
  heartbeat?: Date;
}) => {
  const operation = useSelector((s: AppState) => {
    if (resourceType === "app") {
      return selectLatestOpByAppId(s, { appId: resourceId });
    } else {
      return selectLatestOpByDatabaseId(s, { dbId: resourceId });
    }
  });

  if (!operation) {
    return null;
  }

  const bannerStatus: StatusVariant =
    operation.status === "succeeded"
      ? "success"
      : operation.status === "failed"
      ? "error"
      : operation.status === "running" || operation.status === "queued"
      ? "primary"
      : "default";

  const gerundOfOpType =
    operation.type === "configure" ? "configuring" : `${operation.type}ing`;

  // is most recent operation a failure and deprovision or provision
  if (["failed", "succeeded"].includes(operation.status)) {
    return (
      <BannerWrapper>
        <Banner variant={bannerStatus}>
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

  // is provision or deprovision operation running?
  if (["running", "queued"].includes(operation.status)) {
    return (
      <BannerWrapper>
        <Banner
          variant={bannerStatus}
          iconOverride={
            <div className="animate-spin-slow 5s">
              <IconRefresh color="#FFF" />
            </div>
          }
        >
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
