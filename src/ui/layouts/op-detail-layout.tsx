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
  OpStatus,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function OpHeader({
  op,
  resourceHandle,
}: { op: DeployOperation; resourceHandle: string }) {
  const url = getResourceUrl(op);

  return (
    <DetailHeader>
      <DetailTitleBar title="Operation Details" />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">{capitalize(op.type)}</DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Last Updated">
            {capitalize(prettyEnglishDateWithTime(op.updatedAt))}
          </DetailInfoItem>
        </div>

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="User">{op.userName}</DetailInfoItem>
        </div>

        <DetailInfoItem title="Resource">
          {url ? <Link to={url}>{resourceHandle}</Link> : resourceHandle}
          <div className="text-gray-500 text-sm">
            {prettyResourceType(op.resourceType)}
          </div>
        </DetailInfoItem>
        <div className="col-span-2">
          <DetailInfoItem title="Note">{op.note || "N/A"}</DetailInfoItem>
        </div>
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
