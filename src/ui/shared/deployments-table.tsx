import { prettyDateTime } from "@app/date";
import { selectImageById, selectOperationById } from "@app/deploy";
import { getRegistryParts, getRepoNameFromUrl } from "@app/deployment";
import { useSelector } from "@app/react";
import { deploymentDetailUrl } from "@app/routes";
import { prettyGitSha } from "@app/string-utils";
import { DeployApp, Deployment } from "@app/types";
import { Link } from "react-router-dom";
import { ButtonLink } from "./button";
import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { OpStatus } from "./operation-status";
import { EmptyTr, TBody, THead, Table, Td, Tr } from "./table";
import { tokens } from "./tokens";

export function DeploymentTagText({ deployment }: { deployment: Deployment }) {
  if (deployment.gitRef) {
    return <Code>{deployment.gitRef}</Code>;
  }

  if (deployment.dockerImage) {
    return <Code>{getRegistryParts(deployment.dockerImage).tag}</Code>;
  }

  return null;
}

export function DeploymentGitSha({ deployment }: { deployment: Deployment }) {
  const image = useSelector((s) =>
    selectImageById(s, { id: deployment.imageId }),
  );
  const gitRef = deployment.gitCommitSha || image.gitRef;

  if (deployment.gitCommitUrl) {
    return (
      <ExternalLink href={deployment.gitCommitUrl}>
        {prettyGitSha(gitRef)}
      </ExternalLink>
    );
  }

  return <Code>{prettyGitSha(gitRef)}</Code>;
}

export function SourceName({
  app,
  deployment,
}: { app: DeployApp; deployment: Deployment }) {
  if (deployment.gitRepositoryUrl) {
    const repoName = getRepoNameFromUrl(deployment.gitRepositoryUrl);
    return (
      <ExternalLink href={deployment.gitRepositoryUrl}>{repoName}</ExternalLink>
    );
  }

  if (app.gitRepo) {
    return app.gitRepo;
  }

  if (deployment.dockerImage) {
    const repoName = getRegistryParts(deployment.dockerImage).name;
    if (deployment.dockerRepositoryUrl) {
      return (
        <ExternalLink href={deployment.dockerRepositoryUrl}>
          {repoName}
        </ExternalLink>
      );
    }
    return repoName;
  }

  return "";
}

export function GitMetadata({ deployment }: { deployment: Deployment }) {
  const msg = deployment.gitCommitMessage;
  if (msg.length > 72) {
    return `${msg.slice(0, 72)}...`;
  }

  return deployment.gitCommitMessage;
}

function DeploymentRow({
  app,
  deployment,
}: { app: DeployApp; deployment: Deployment }) {
  const op = useSelector((s) =>
    selectOperationById(s, { id: deployment.operationId }),
  );
  // const isActive = app.currentDeploymentId === deployment.id;

  return (
    <Tr>
      <Td>
        <Link
          to={deploymentDetailUrl(deployment.id)}
          className={tokens.type["table link"]}
        >
          {deployment.id}
        </Link>
      </Td>
      <Td>
        <OpStatus status={op.status} />
      </Td>
      <Td>
        <SourceName app={app} deployment={deployment} />
      </Td>
      <Td>
        <DeploymentTagText deployment={deployment} />
      </Td>
      <Td>
        <DeploymentGitSha deployment={deployment} />
      </Td>
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
        <Td>Commit</Td>
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
