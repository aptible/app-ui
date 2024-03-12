import { prettyDateTime } from "@app/date";
import { selectOperationById } from "@app/deploy";
import {
  getRegistryParts,
  getRepoNameFromUrl,
  getTagText,
} from "@app/deployment";
import { useSelector } from "@app/react";
import { deploymentDetailUrl } from "@app/routes";
import { DeployApp, Deployment } from "@app/types";
import { Link } from "react-router-dom";
import { ButtonLink } from "./button";
import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { OpStatus } from "./operation-status";
import { EmptyTr, TBody, THead, Table, Td, Tr } from "./table";

export function SourceName({ deployment }: { deployment: Deployment }) {
  if (deployment.dockerImage) {
    const repoName = getRegistryParts(deployment.dockerImage).name;
    if (deployment.dockerRepositoryUrl) {
      return (
        <ExternalLink href={deployment.dockerRepositoryUrl}>
          <Code>{repoName}</Code>
        </ExternalLink>
      );
    }
    return <Code>{repoName}</Code>;
  }

  const repoName = getRepoNameFromUrl(deployment.gitRepositoryUrl);
  if (deployment.gitRepositoryUrl) {
    return (
      <ExternalLink href={deployment.gitRepositoryUrl}>
        <Code>{repoName}</Code>
      </ExternalLink>
    );
  }

  return <Code>{repoName}</Code>;
}

export function GitMetadata({ deployment }: { deployment: Deployment }) {
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
        <SourceName deployment={deployment} />
      </Td>
      <Td>{getTagText(deployment)}</Td>
      <Td>
        <GitMetadata deployment={deployment} />
      </Td>
      <Td>{prettyDateTime(deployment.createdAt)}</Td>
      <Td variant="right">
        <ButtonLink
          to={deploymentDetailUrl(deployment.id)}
          size="sm"
          className="w-15"
          variant="primary"
        >
          View
        </ButtonLink>
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
        <Td>Source</Td>
        <Td>Tag</Td>
        <Td>Message</Td>
        <Td>Date</Td>
        <Td variant="right">Actions</Td>
      </THead>

      <TBody>
        {deployments.length === 0 ? (
          <EmptyTr colSpan={7}>No deployments found</EmptyTr>
        ) : null}
        {deployments.map((deploy) => {
          return (
            <DeploymentRow key={deploy.id} app={app} deployment={deploy} />
          );
        })}
      </TBody>
    </Table>
  );
}
