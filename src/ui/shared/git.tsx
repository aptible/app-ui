import { Tooltip } from "@app/ui/shared/tooltip";
import { Code } from "./code";
import { OptionalExternalLink } from "./external-link";

export const GitRef = ({
  gitRef,
  commitSha,
  commitUrl,
}: {
  gitRef: string | null;
  commitSha: string;
  commitUrl?: string;
}) => {
  const ref = gitRef?.trim() || "";
  const sha = commitSha.trim().slice(0, 7);
  const url = commitUrl || "";

  if (!sha) {
    return <em>Not Provided</em>;
  }

  return (
    <div className="inline-block">
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
