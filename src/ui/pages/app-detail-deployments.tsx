import { selectAppById } from "@app/deploy";
import {
  fetchDeploymentsByAppId,
  selectDeploymentsByAppId,
} from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import { useParams } from "react-router-dom";
import { DeploymentsTable, DetailPageSections } from "../shared";

export function AppDetailDeploymentsPage() {
  const { id = "" } = useParams();
  const app = useSelector((s) => selectAppById(s, { id }));
  useQuery(fetchDeploymentsByAppId({ id: app.id }));
  const deployments = useSelector((s) =>
    selectDeploymentsByAppId(s, { appId: app.id }),
  );

  return (
    <DetailPageSections>
      <DeploymentsTable deployments={deployments} app={app} />
    </DetailPageSections>
  );
}
