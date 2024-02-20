import { selectAppById } from "@app/deploy";
import { useSelector } from "@app/react";
import { appCiCdGithubUrl } from "@app/routes";
import { Navigate, useParams } from "react-router";
import {
  AppAutoDeployGuide,
  Box,
  ButtonLinkDocs,
  Group,
  TabItem,
  Tabs,
  tokens,
} from "../shared";

export function AppDetailCiCdPage() {
  const { id = "" } = useParams();
  return <Navigate to={appCiCdGithubUrl(id)} replace />;
}

export function AppDetailCiCdGuidePage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));
  const tabs: TabItem[] = [
    {
      name: "GitHub Action",
      href: appCiCdGithubUrl(id),
    },
  ];

  return (
    <Box>
      <div className="flex justify-between items-center">
        <h3 className={tokens.type.h3}>How to Deploy Changes Automatically</h3>
        <ButtonLinkDocs href="https://www.aptible.com/docs/continuous-integration-provider-deployment" />
      </div>

      <Group className="mt-4">
        <Tabs tabs={tabs} />
        <AppAutoDeployGuide app={app} />
      </Group>
    </Box>
  );
}
