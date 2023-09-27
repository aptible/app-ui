import { prettyEnglishDateWithTime } from "@app/date";
import {
  fetchOperationById,
  getResourceUrl,
  prettyResourceType,
  selectOperationById,
  selectResourceNameByOperationId,
} from "@app/deploy";
import { activityUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployOperation } from "@app/types";
import { useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";
import { useQuery } from "saga-query/react";
import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  IconInfo,
  OpStatus,
  Tooltip,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function OpHeader({
  op,
  resourceHandle,
}: { op: DeployOperation; resourceHandle: string }) {
  const url = getResourceUrl(op);

  return (
    <DetailHeader>
      <DetailTitleBar
        title="Operation Details"
        icon={
          <img
            src={"/resource-types/logo-activity.png"}
            className="w-8 h-8 mr-3"
            aria-label="Operation"
          />
        }
      />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">
          <div className="flex items-center">
            {capitalize(op.type)}
            <Tooltip
              className="text-sm w-[100vw]"
              text="Env Vars: VALUE, VALUE, VALUE"
            >
              <IconInfo className="h-5 opacity-50 hover:opacity-100" />
            </Tooltip>
          </div>
        </DetailInfoItem>
        <DetailInfoItem title="Created">
          {capitalize(prettyEnglishDateWithTime(op.createdAt))}
        </DetailInfoItem>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <DetailInfoItem title="Last Updated">
          {capitalize(prettyEnglishDateWithTime(op.updatedAt))}
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
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));
  const resourceHandle = useSelector((s: AppState) =>
    selectResourceNameByOperationId(s, { id: op.id }),
  );
  const loader = useQuery(fetchOperationById({ id }));

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={[{ name: "Activity", to: activityUrl() }]}
      title={`Operation: ${op.id}`}
      detailsBox={<OpHeader op={op} resourceHandle={resourceHandle} />}
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
