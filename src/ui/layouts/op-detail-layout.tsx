import { useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";

import { prettyEnglishDateWithTime } from "@app/date";
import {
  getResourceUrl,
  prettyResourceType,
  selectOperationById,
} from "@app/deploy";
import { activityUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployOperation } from "@app/types";

import { Box, DetailPageHeaderView, OpStatus, tokens } from "../shared";

import { DetailPageLayout } from "./detail-page";
import cn from "classnames";

const opDetailBox = ({ op }: { op: DeployOperation }): React.ReactElement => {
  const url = getResourceUrl(op);
  return (
    <div className={cn(tokens.layout["main width"], "py-6 -mt-5 -mb-5")}>
      <Box>
        <h1 className="text-md text-gray-500">Operation Details</h1>
        <div className="flex w-1/1">
          <div className="flex-col w-1/2">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Type</h3>
              <p>{capitalize(op.type)}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Status</h3>
              <p>
                <OpStatus status={op.status} />
              </p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Last Updated
              </h3>
              <p>{capitalize(prettyEnglishDateWithTime(op.updatedAt))}</p>
            </div>
          </div>

          <div className="flex-col w-1/2">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Resource Type
              </h3>
              {prettyResourceType(op.resourceType)}
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Resource
              </h3>
              <p>{url ? <Link to={url}>{op.id}</Link> : op.id}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">User</h3>
              <p>
                <a href={`mailto:${op.userEmail}`}>{op.userName}</a>
              </p>
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

function OpPageHeader() {
  const { id = "" } = useParams();
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));

  return (
    <DetailPageHeaderView
      breadcrumbs={[{ name: "Activity", to: activityUrl() }]}
      title={op.id ? op.id : "Loading..."}
      detailsBox={opDetailBox({ op })}
    />
  );
}

export const OpDetailLayout = () => {
  return (
    <DetailPageLayout header={<OpPageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
