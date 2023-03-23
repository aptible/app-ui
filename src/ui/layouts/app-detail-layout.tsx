import { Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { prettyEnglishDate } from "@app/date";
import type { AppState, DeployApp } from "@app/types";
import { selectAppById } from "@app/deploy";
import {
  appActivityUrl,
  appDetailUrl,
  appSecurityUrl,
  appSettingsUrl,
  appsUrl,
} from "@app/routes";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconCopy,
  IconExternalLink,
  TabItem,
  tokens,
} from "../shared";

import { DetailPageLayout } from "./detail-page";
import { capitalize } from "@app/string-utils";

const crumbs = [{ name: "Apps", to: appsUrl() }];

const appDetailBox = ({ app }: { app: DeployApp }): React.ReactElement => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full py-6">
    <Box>
      <Button className="flex ml-auto" variant="white">
        View Docs
        <IconExternalLink className="inline ml-3 h-5 mt-0" />
      </Button>
      <h1 className="text-lg text-gray-500 -mt-10">App Details</h1>
      <div className="flex w-1/1">
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Git Remote</h3>
            <p>
              {app.gitRepo} <IconCopy className="inline h-4" color="#888C90" />
            </p>
          </div>
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Git Ref</h3>
            <p>Unused</p>
          </div>
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Docker Image</h3>
            {app.currentImage?.dockerRepo}
          </div>
        </div>
        <div className="flex-col w-1/2">
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Repository</h3>
            <p>{app.handle}</p>
          </div>
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Branch</h3>
            <p>main</p>
          </div>
          <div className="mt-4">
            <h3 className={tokens.type.h4}>Last Deployed</h3>
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

  const tabs = [
    { name: "Overview", href: appDetailUrl(id) },
    { name: "Activity", href: appActivityUrl(id) },
    { name: "Security", href: appSecurityUrl(id) },
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
