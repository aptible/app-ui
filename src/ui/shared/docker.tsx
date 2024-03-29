import { Code } from "./code";
import { OptionalExternalLink } from "./external-link";

export const DockerImage = ({
  image,
  digest,
  repoUrl,
}: {
  image: string;
  digest: string;
  repoUrl?: string;
}) => {
  const shortDigest = digest.replace("sha256:", "").slice(0, 11);
  const url = repoUrl || "";

  return (
    <div className="inline-block">
      <Code>
        <OptionalExternalLink href={url} linkIf={!!url.match(/^https?:\/\//)}>
          {image}
        </OptionalExternalLink>
      </Code>{" "}
      @ <Code>sha256:{shortDigest}</Code>
    </div>
  );
};
