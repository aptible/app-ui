import { selectAppById } from "@app/deploy";
import {
  fetchDeploymentsByAppId,
  selectDeploymentsByAppId,
} from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import { appDeployResumeUrl } from "@app/routes";
import { useNavigate, useParams } from "react-router-dom";
import {
  ActionBar,
  ButtonCreate,
  DeploymentsTable,
  DetailPageSections,
  Group,
} from "../shared";

export function AppDetailDeploymentsPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchDeploymentsByAppId({ id: app.id }));
  const deployments = useSelector((s) =>
    selectDeploymentsByAppId(s, { appId: app.id }),
  );
  const navigate = useNavigate();
  const onDeploy = () => {
    navigate(appDeployResumeUrl(app.id));
  };

  return (
    <DetailPageSections>
      <Group>
        <ActionBar>
          <ButtonCreate
            className="w-fit"
            envId={app.environmentId}
            onClick={onDeploy}
          >
            Deployment Monitor
          </ButtonCreate>
        </ActionBar>
        <DeploymentsTable deployments={deployments} app={app} />
      </Group>
    </DetailPageSections>
  );
}
