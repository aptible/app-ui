import { prettyDateTime } from "@app/date";
import {
  fetchOperationById,
  getResourceUrl,
  pollOperationById,
  prettyResourceType,
  selectOperationById,
  selectResourceNameByOperationId,
} from "@app/deploy";
import { findLoaderComposite } from "@app/loaders";
import { useSelector } from "@app/react";
import { useQuery } from "@app/react";
import { useLoader } from "@app/react";
import { activityUrl, operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { DeployOperation } from "@app/types";
import { Link, Outlet, useParams } from "react-router-dom";
import {
  AppConfigureTooltip,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  Group,
  OpStatus,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function OpHeader({
  op,
  resourceHandle,
  isLoading,
}: { op: DeployOperation; resourceHandle: string; isLoading: boolean }) {
  const url = getResourceUrl(op);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Operation Details"
        isLoading={isLoading}
        icon={
          <img
            src={"/resource-types/logo-activity.png"}
            className="w-[32px] h-[32px] mr-3"
            aria-label="Operation"
          />
        }
      />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">
          <Group variant="horizontal" size="xs" className="items-center">
            {capitalize(op.type)}
            <AppConfigureTooltip op={op} />
          </Group>
        </DetailInfoItem>
        <DetailInfoItem title="Created">
          {prettyDateTime(op.createdAt)}
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <DetailInfoItem title="Last Updated">
          {prettyDateTime(op.updatedAt)}
        </DetailInfoItem>

        <DetailInfoItem title="Resource">
          {url ? <Link to={url}>{resourceHandle}</Link> : resourceHandle}
          <div className="text-gray-500">
            {prettyResourceType(op.resourceType)}
          </div>
        </DetailInfoItem>
        <DetailInfoItem title="User">
          {op.userName}
          <div className="text-gray-500">Note: {op.note || "N/A"}</div>
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function OpPageHeader() {
  const { id = "" } = useParams();
  const op = useSelector((s) => selectOperationById(s, { id }));
  const resourceHandle = useSelector((s) =>
    selectResourceNameByOperationId(s, { id: op.id }),
  );
  const loaderOp = useQuery(fetchOperationById({ id }));
  const pollLoader = useLoader(pollOperationById({ id: op.id }));
  const loader = findLoaderComposite([loaderOp, pollLoader]);

  return (
    <DetailPageHeaderView
      {...loaderOp}
      breadcrumbs={[{ name: "Activity", to: activityUrl() }]}
      title={`Operation: ${op.id}`}
      lastBreadcrumbTo={operationDetailUrl(op.id)}
      detailsBox={
        <OpHeader
          op={op}
          resourceHandle={resourceHandle}
          isLoading={loader.isLoading}
        />
      }
    />
  );
}

export const OpDetailLayout = () => {
  return (
    <AppSidebarLayout header={<OpPageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
};
