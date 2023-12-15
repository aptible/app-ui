import { prettyDateTime } from "@app/date";
import { selectAppById, selectOperationById } from "@app/deploy";
import {
  fetchDeploymentsByAppId,
  selectDeploymentsByAppId,
} from "@app/deployment";
import { deploymentDetailRollbackUrl, deploymentDetailUrl } from "@app/routes";
import { AppState, Deployment } from "@app/types";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "starfx/react";
import {
  ButtonLink,
  Code,
  DetailPageSections,
  OpStatus,
  TBody,
  THead,
  Table,
  Td,
  Tr,
} from "../shared";

function DeploymentRow({ deployment }: { deployment: Deployment }) {
  const op = useSelector((s: AppState) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  let ref = "";
  if (deployment.dockerImage) {
    ref = deployment.dockerImage.replace(/^[\w.\/-]+:/, "");
  } else if (deployment.gitRef) {
    ref = deployment.gitRef;
  }

  return (
    <Tr>
      <Td>
        <Link to={deploymentDetailUrl(deployment.id)}>{deployment.id}</Link>
      </Td>
      <Td>
        <OpStatus status={op.status} />
      </Td>
      <Td>{op.type}</Td>
      <Td>
        <Code>{ref}</Code>
      </Td>
      <Td>{prettyDateTime(deployment.createdAt)}</Td>
      <Td variant="right">
        <ButtonLink size="sm" to={deploymentDetailRollbackUrl(deployment.id)}>
          Rollback
        </ButtonLink>
      </Td>
    </Tr>
  );
}

export function AppDetailDeploymentsPage() {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchDeploymentsByAppId({ id: app.id }));
  const deployments = useSelector((s: AppState) =>
    selectDeploymentsByAppId(s, { appId: app.id }),
  );

  return (
    <DetailPageSections>
      <Table>
        <THead>
          <Td>ID</Td>
          <Td>Status</Td>
          <Td>Type</Td>
          <Td>Ref</Td>
          <Td>Date</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {deployments.map((deploy) => {
            return <DeploymentRow key={deploy.id} deployment={deploy} />;
          })}
        </TBody>
      </Table>
    </DetailPageSections>
  );
}
