import { prettyDateTime } from "@app/date";
import { selectAppById, selectOperationById } from "@app/deploy";
import { useSelector } from "@app/react";
import {
  appDetailUrl,
  deploymentDetailRollbackUrl,
  deploymentDetailUrl,
} from "@app/routes";
import { DeployApp, Deployment } from "@app/types";
import { Link } from "react-router-dom";
import { ButtonLink } from "./button";
import { Code } from "./code";
import { OpStatus } from "./operation-status";
import { TBody, THead, Table, Td, Tr } from "./table";

function DeploymentRow({
  app,
  deployment,
}: { app: DeployApp; deployment: Deployment }) {
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  const ref = deployment.dockerTag || deployment.gitHead;
  const isActive = app.currentDeploymentId === deployment.id;

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
        {isActive ? null : (
          <ButtonLink size="sm" to={deploymentDetailRollbackUrl(deployment.id)}>
            Rollback
          </ButtonLink>
        )}
      </Td>
    </Tr>
  );
}

export function DeploymentsTable({
  deployments,
  app,
}: { deployments: Deployment[]; app: DeployApp }) {
  return (
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
          return (
            <DeploymentRow key={deploy.id} app={app} deployment={deploy} />
          );
        })}
      </TBody>
    </Table>
  );
}

function SourceDeploymentRow({ deployment }: { deployment: Deployment }) {
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  const app = useSelector((s) => selectAppById(s, { id: deployment.appId }));
  const ref = deployment.dockerTag || deployment.gitHead;

  return (
    <Tr>
      <Td>
        <Link to={appDetailUrl(app.id)}>{app.handle}</Link>
      </Td>
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
    </Tr>
  );
}

export function DeploymentsTableBySource({
  deployments,
}: { deployments: Deployment[] }) {
  return (
    <Table>
      <THead>
        <Td>App</Td>
        <Td>ID</Td>
        <Td>Status</Td>
        <Td>Type</Td>
        <Td>Source Ref</Td>
        <Td>Date</Td>
        <Td variant="right">Actions</Td>
      </THead>

      <TBody>
        {deployments.map((deploy) => {
          return <SourceDeploymentRow key={deploy.id} deployment={deploy} />;
        })}
      </TBody>
    </Table>
  );
}
