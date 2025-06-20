import {
  hasDeployEndpoint,
  selectAppById,
  selectEnvironmentById,
  selectFirstEndpointByAppId,
  selectLatestDeployOp,
} from "@app/deploy";
import { useSelector } from "@app/react";
import { environmentAppsUrl } from "@app/routes";
import { prettyGitSha } from "@app/string-utils";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { EndpointUrl } from "./endpoint";
import { IconGitBranch, IconGlobe } from "./icons";
import { Pill } from "./pill";
import { StatusBox } from "./status-box";
import { tokens } from "./tokens";

export const ResourceGroupBox = ({
  appId,
  children,
  status,
  handle,
}: {
  appId: string;
  children: React.ReactNode;
  status: JSX.Element;
  handle: string;
}) => {
  const vhost = useSelector((s) => selectFirstEndpointByAppId(s, { appId }));
  const deployOp = useSelector((s) => selectLatestDeployOp(s, { appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );

  return (
    <StatusBox>
      <div className="border-b border-black-100 pb-4 ">
        <div className="flex items-start">
          <div>
            <img
              alt="default project logo"
              src="/resource-types/logo-app.png"
              style={{ width: 32, height: 32 }}
              className="mr-3 max-w-none mt-2"
            />
          </div>
          <div>
            <h4 className={`break-words ${tokens.type.h4}`}>{handle}</h4>
            <div className="text-black-500 text-sm pb-1">
              {hasDeployEndpoint(vhost) && vhost.status === "provisioned" ? (
                <EndpointUrl enp={vhost} />
              ) : (
                "Pending HTTP Endpoint"
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center mt-1 gap-1">
          {status}

          <Pill icon={<IconGlobe color="#595E63" variant="sm" />}>
            <Link to={environmentAppsUrl(environment.id)}>{env.handle}</Link>
          </Pill>

          <Pill
            icon={<IconGitBranch color="#595E63" variant="sm" />}
            title={deployOp.gitRef}
          >
            {prettyGitSha(deployOp.gitRef) || "Pending"}
          </Pill>
        </div>
      </div>

      {children}
    </StatusBox>
  );
};
