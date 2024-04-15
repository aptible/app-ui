import { selectAppById } from "@app/deploy";
import { useSelector } from "@app/react";
import { appCiCdGithubUrl, appCiCdTerraformUrl } from "@app/routes";
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

function AppDetailCiCdLayout({ children }: { children: React.ReactNode }) {
  const { id = "" } = useParams();
  const tabs: TabItem[] = [
    {
      name: "GitHub Action",
      href: appCiCdGithubUrl(id),
    },
    {
      name: "Terraform",
      href: appCiCdTerraformUrl(id),
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
        <div>{children}</div>
      </Group>
    </Box>
  );
}

export function AppDetailCiCdGithubPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));

  return (
    <AppDetailCiCdLayout>
      <Group>
        <AppAutoDeployGuide app={app} />

        <div>
          <h4 className={tokens.type.h4}>4. Push code to GitHub</h4>
        </div>

        <div>
          <h4 className={tokens.type.h4}>5. Trigger deployment</h4>
        </div>
      </Group>
    </AppDetailCiCdLayout>
  );
}

export function AppDetailCiCdTerraformPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));
  console.log(app);

  return (
    <AppDetailCiCdLayout>
      <Group>
        <div>
          <h4 className={tokens.type.h4}>1. Terraform!</h4>
        </div>
      </Group>
    </AppDetailCiCdLayout>
  );
}
