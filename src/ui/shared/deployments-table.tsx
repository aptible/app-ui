import { prettyDateTime } from "@app/date";
import { fetchImageById, selectAppById, selectImageById } from "@app/deploy";
import {
  getRegistryParts,
  getRepoNameFromUrl,
  selectDeploymentsBySourceId,
} from "@app/deployment";
import { useQuery, useSelector } from "@app/react";
import { appDetailUrl, deploymentDetailUrl } from "@app/routes";
import { fetchDeploymentsBySourceId } from "@app/source";
import { prettyGitSha } from "@app/string-utils";
import { DeployApp, Deployment } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { Group } from "@app/ui/shared/group";
import { Tooltip } from "@app/ui/shared/tooltip";
import { Link } from "react-router-dom";
import { ButtonLink } from "./button";
import { Code } from "./code";
import { ExternalLink, OptionalExternalLink } from "./external-link";
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

const AppCell = ({ app }: { app: DeployApp }) => {
  return (
    <Td className="flex-1">
      <Link to={appDetailUrl(app.id)} className="flex">
        <p className={`${tokens.type["table link"]} leading-8`}>{app.handle}</p>
      </Link>
    </Td>
  );
};

const GitRefCell = ({
  gitRef,
  commitSha,
  commitUrl,
}: { gitRef: string | null; commitSha: string; commitUrl?: string }) => {
  const ref = gitRef?.trim() || "";
  const sha = commitSha.trim().slice(0, 7);
  const url = commitUrl || "";

  if (!sha) {
    return (
      <Td>
        <em>Not Provided</em>
      </Td>
    );
  }

  return (
    <Td>
      <Code>{ref || sha}</Code>
      {ref && sha && ref !== sha ? (
        <>
          {" "}
          @{" "}
          <Code>
            <OptionalExternalLink
              href={url}
              linkIf={!!url.match(/^https?:\/\//)}
            >
              {sha}
            </OptionalExternalLink>
          </Code>
        </>
      ) : null}
    </Td>
  );
};

const GitCommitMessageCell = ({ message }: { message: string }) => {
  if (!message) {
    return (
      <Td>
        <em>Not Provided</em>
      </Td>
    );
  }

  const firstLine = message.trim().split("\n")[0];

  return (
    <Td>
      <Tooltip text={message} fluid>
        <p className="leading-8 text-ellipsis whitespace-nowrap max-w-[30ch] overflow-hidden inline-block">
          {firstLine}
          {message.length > firstLine.length ? " ..." : ""}
        </p>
      </Tooltip>
    </Td>
  );
};

const DockerImageCell = ({
  image,
  digest,
  repoUrl,
}: { image: string; digest: string; repoUrl?: string }) => {
  const shortDigest = digest.replace("sha256:", "").slice(0, 11);
  const url = repoUrl || "";

  return (
    <Td>
      <Code>
        <OptionalExternalLink href={url} linkIf={!!url.match(/^https?:\/\//)}>
          {image}
        </OptionalExternalLink>
      </Code>{" "}
      @ <Code>sha256:{shortDigest}</Code>
    </Td>
  );
};

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
      <AppCell app={app} />
      <GitRefCell
        gitRef={deployment.gitRef}
        commitSha={deployment.gitCommitSha}
        commitUrl={deployment.gitCommitUrl}
      />
      <GitCommitMessageCell message={deployment.gitCommitMessage} />
      <DockerImageCell
        image={deployment.dockerImage || currentImage.dockerRepo}
        digest={currentImage.dockerRef}
        repoUrl={deployment.dockerRepositoryUrl}
      />
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
