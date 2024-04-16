import { Tooltip } from "@app/ui/shared/tooltip";
import { useMemo } from "react";
import { Code } from "./code";
import { OptionalExternalLink } from "./external-link";
import { IconCommit } from "./icons";

export const GitRef = ({
  gitRef,
  commitSha,
  commitUrl,
  className,
}: {
  gitRef: string | null;
  commitSha: string;
  commitUrl?: string;
  className?: string;
}) => {
  const sha = commitSha.trim();
  const shortSha = sha.slice(0, 7);
  const ref = gitRef?.trim() || "";
  const url = commitUrl || "";

  if (!sha) {
    return <em>Not Provided</em>;
  }

  const commitWidget = useMemo(
    () => (
      <Code className="whitespace-nowrap">
        <OptionalExternalLink href={url} linkIf={!!url.match(/^https?:\/\//)}>
          <IconCommit color="#595E63" variant="sm" className="inline mr-1" />
          {shortSha}
        </OptionalExternalLink>
      </Code>
    ),
    [url, shortSha],
  );

  return (
    <div className={`inline-block whitespace-nowrap ${className}`}>
      {ref && sha && ref !== sha ? (
        <>
          <Code>{ref || shortSha}</Code> @ {commitWidget}
        </>
      ) : (
        commitWidget
      )}
    </div>
  );
};

export const GitCommitMessage = ({ message }: { message: string }) => {
  if (!message) {
    return <em>Not Provided</em>;
  }

  const firstLine = message.trim().split("\n")[0];
  return (
    <div className="inline-block">
      <Tooltip text={message} fluid>
        <p className="leading-8 text-ellipsis whitespace-nowrap max-w-[30ch] overflow-hidden inline-block">
          {firstLine}
          {message.length > firstLine.length ? " ..." : ""}
        </p>
      </Tooltip>
    </div>
  );
};
