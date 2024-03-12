import { prettyDateTime } from "@app/date";
import { selectOperationById } from "@app/deploy";
import { useSelector } from "@app/react";
import { deploymentDetailUrl } from "@app/routes";
import { prettyGitSha } from "@app/string-utils";
import { DeployApp, Deployment } from "@app/types";
import { Link } from "react-router-dom";
import { ExternalLink } from ".";
import { OpStatus } from "./operation-status";
import { TBody, THead, Table, Td, Tr } from "./table";

function getRefText(deployment: Deployment): string {
  if (deployment.dockerImage) {
    return deployment.dockerImage;
  }

  if (deployment.gitRef) {
    return `${deployment.gitRef} (${prettyGitSha(deployment.gitCommitSha)})`;
  }

  return deployment.gitCommitSha;
}

function SourceRef({ deployment }: { deployment: Deployment }) {
  const ref = getRefText(deployment);

  if (deployment.gitRepositoryUrl) {
    return (
      <ExternalLink href={deployment.gitRepositoryUrl}>{ref}</ExternalLink>
    );
  }

  return <span>{ref}</span>;
}

function GitMetadata({ deployment }: { deployment: Deployment }) {
  if (!deployment.gitCommitUrl) {
    return <span>deployment.gitCommitMessage</span>;
  }

  return (
    <ExternalLink href={deployment.gitCommitUrl}>
      {deployment.gitCommitMessage}
    </ExternalLink>
  );
}

function DeploymentRow({
  deployment,
}: { app: DeployApp; deployment: Deployment }) {
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  // const isActive = app.currentDeploymentId === deployment.id;

  return (
    <Tr>
      <Td>
        <Link to={deploymentDetailUrl(deployment.id)}>{deployment.id}</Link>
      </Td>
      <Td>
        <OpStatus status={op.status} />
      </Td>
      <Td>
        <SourceRef deployment={deployment} />
      </Td>
      <Td>
        <GitMetadata deployment={deployment} />
      </Td>
      <Td>{prettyDateTime(deployment.createdAt)}</Td>
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
        <Td>Source</Td>
        <Td>Message</Td>
        <Td>Date</Td>
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
