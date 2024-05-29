import type { DeploySource } from "@app/types";
import type { ComponentProps } from "react";

export const SourceLogo = (
  props: ComponentProps<"img"> & { source: DeploySource },
) => {
  const { source, ...rest } = props;

  let logo = "/resource-types/logo-source.png";
  let defaultLabel = "Git Source";

  // Detect GitHub sources
  if (source.url.match(/github\.com/i)) {
    logo = "/resource-types/logo-github.png";
    defaultLabel = "GitHub Source";
  }
  // Detect GitLab sources
  else if (source.url.match(/gitlab\.com/i)) {
    logo = "/resource-types/logo-gitlab.png";
    defaultLabel = "GitLab Source";
  }

  return (
    <img
      src={logo}
      {...rest}
      aria-label={props["aria-label"] || defaultLabel}
      alt={props.alt || defaultLabel}
    />
  );
};
