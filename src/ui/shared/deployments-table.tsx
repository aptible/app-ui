import { prettyDateTime } from "@app/date";
import { fetchImageById, selectAppById, selectImageById } from "@app/deploy";
import {
  getRegistryParts,
  getRepoNameFromUrl,
  selectDeploymentsBySourceId,
} from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import {
  appDetailUrl,
  deploymentDetailUrl,
  sourceDetailUrl,
} from "@app/routes";
import { fetchDeploymentsBySourceId, selectSourceById } from "@app/source";
import { prettyGitSha } from "@app/string-utils";
import { DeployApp, Deployment } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { Group } from "@app/ui/shared/group";
import { Link } from "react-router-dom";
import { ButtonLink } from "./button";
import { Code } from "./code";
import { DockerImage } from "./docker";
import { ExternalLink } from "./external-link";
import { GitCommitMessage, GitRef } from "./git";
import { OpStatus } from "./operation-status";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "./table";
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
  const gitRef = deployment.gitCommitSha;
  if (!gitRef) return null;

  if (deployment.gitCommitUrl) {
    return (
      <Code>
        <ExternalLink href={deployment.gitCommitUrl}>
          {prettyGitSha(gitRef)}
        </ExternalLink>
      </Code>
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

  return "Aptible Git Deployment";
}

export function GitMetadata({ deployment }: { deployment: Deployment }) {
  const msg = deployment.gitCommitMessage;
  if (msg.length > 72) {
    return <span title={msg}>{`${msg.slice(0, 72)}...`}</span>;
  }

  return <span>{deployment.gitCommitMessage}</span>;
}

function DeploymentRow({
  app,
  deployment,
}: { app: DeployApp; deployment: Deployment }) {
  const image = useSelector((s) =>
    selectImageById(s, { id: deployment.imageId }),
  );
  const source = useSelector((s) =>
    selectSourceById(s, { id: deployment.sourceId }),
  );

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
        <OpStatus status={deployment.status} />
      </Td>
      <Td>
        {(source.id && (
          <Link
            to={sourceDetailUrl(deployment.sourceId)}
            className={tokens.type["table link"]}
          >
            {source.displayName}
          </Link>
        )) || <em>Not Provided</em>}
      </Td>
      <Td>
        <GitRef
          gitRef={deployment.gitRef}
          commitSha={deployment.gitCommitSha}
          commitUrl={deployment.gitCommitUrl}
        />
      </Td>
      <Td>
        <GitCommitMessage message={deployment.gitCommitMessage} />
      </Td>
      <Td>
        <DockerImage
          image={deployment.dockerImage || image.dockerRepo}
          digest={image.dockerRef}
          repoUrl={deployment.dockerRepositoryUrl}
        />
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
        <Td>Git Ref</Td>
        <Td>Commit Message</Td>
        <Td>Docker Image</Td>
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

export function DeploymentSourceRow({
  deployment,
}: { deployment: Deployment }) {
  const app = useSelector((s) => selectAppById(s, { id: deployment.appId }));

  useQuery(fetchImageById({ id: app.currentImageId }));
  const currentImage = useSelector((s) =>
    selectImageById(s, { id: app.currentImageId }),
  );

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
        <OpStatus status={deployment.status} />
      </Td>
      <Td className="flex-1">
        <Link to={appDetailUrl(app.id)} className="flex">
          <p className={`${tokens.type["table link"]} leading-8`}>
            {app.handle}
          </p>
        </Link>
      </Td>
      <Td>
        <GitRef
          gitRef={deployment.gitRef}
          commitSha={deployment.gitCommitSha}
          commitUrl={deployment.gitCommitUrl}
        />
      </Td>
      <Td>
        <GitCommitMessage message={deployment.gitCommitMessage} />
      </Td>
      <Td>
        <DockerImage
          image={deployment.dockerImage || currentImage.dockerRepo}
          digest={currentImage.dockerRef}
          repoUrl={deployment.dockerRepositoryUrl}
        />
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

export function DeploymentsTableBySource({ sourceId }: { sourceId: string }) {
  useQuery(fetchDeploymentsBySourceId({ id: sourceId }));
  const deployments = useSelector((s) =>
    selectDeploymentsBySourceId(s, { sourceId }),
  );
  const paginated = usePaginate(deployments);

  return (
    <Group>
      <Table>
        <THead>
          <Th>ID</Th>
          <Th>Status</Th>
          <Th>App</Th>
          <Th>Git Ref</Th>
          <Th>Commit Message</Th>
          <Th>Docker Image</Th>
          <Th>Date</Th>
          <Th variant="right">Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={8} /> : null}
          {paginated.data.map((deployment) => {
            return (
              <DeploymentSourceRow
                key={deployment.id}
                deployment={deployment}
              />
            );
          })}
        </TBody>
      </Table>
    </Group>
  );
}
