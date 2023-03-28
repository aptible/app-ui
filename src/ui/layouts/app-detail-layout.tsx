import { Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { prettyEnglishDate } from "@app/date";
import type { AppState, DeployApp } from "@app/types";
import { selectAppById, selectEnvironmentById } from "@app/deploy";
import {
  appActivityUrl,
  appOverviewUrl,
  appEndpointsUrl,
  appSettingsUrl,
  environmentResourcelUrl,
} from "@app/routes";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconCopy,
  IconExternalLink,
  IconGitBranch,
  TabItem,
  tokens,
} from "../shared";

import { DetailPageLayout } from "./detail-page";
import { capitalize } from "@app/string-utils";

const appDetailBox = ({ app }: { app: DeployApp }): React.ReactElement => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full py-6 -mt-5 -mb-5">
    <Box>
      <Button className="flex ml-auto" variant="white">
        View Docs
        <IconExternalLink className="inline ml-3 h-5 mt-0" />
      </Button>
      <h1 className="text-md text-gray-500 -mt-10">App Details</h1>
      <div className="flex w-1/1">
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              Git Remote
            </h3>
            <p>
              {app.gitRepo} <IconCopy className="inline h-4" color="#888C90" />
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Git Ref</h3>
            <p>Unused</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              Docker Image
            </h3>
            {app.currentImage?.dockerRepo}
          </div>
        </div>
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              Repository
            </h3>
            <p>{app.handle}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Branch</h3>
            <p>
              <IconGitBranch
                className="inline"
                style={{ width: 16, height: 16 }}
              />{" "}
              main
            </p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              Last Deployed
            </h3>
            {app.lastDeployOperation
              ? `${capitalize(
                  app.lastDeployOperation.type,
                )} on ${prettyEnglishDate(app.lastDeployOperation?.createdAt)}`
              : "Unknown"}
          </div>
        </div>
      </div>
    </Box>
  </div>
);

function AppPageHeader() {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const crumbs = [
    { name: environment.handle, to: environmentResourcelUrl(environment.id) },
  ];
  // TODO - COME BACK TO THIS
  // Need to kick a user back out of the details page (or lock specific pages if it is deleted)
  // currently the network log will error with a 404 (as the record will be deleted)

  const tabs = [
    { name: "Overview", href: appOverviewUrl(id) },
    { name: "Endpoints", href: appEndpointsUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Settings", href: appSettingsUrl(id) },
  ] as TabItem[];

  return (
    <>
      <DetailPageHeaderView
        breadcrumbs={crumbs}
        title={app ? app.handle : "Loading..."}
        detailsBox={appDetailBox({ app })}
        tabs={tabs}
      />
    </>
  );
}

export const AppDetailLayout = () => {
  return (
    <DetailPageLayout header={<AppPageHeader />}>
      <Outlet />
    </DetailPageLayout>
  );
};
