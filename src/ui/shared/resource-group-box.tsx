import { IconGitBranch, IconGlobe } from "./icons";
import { Pill } from "./pill";
import { StatusBox } from "./status-box";
import { tokens } from "./tokens";
import {
  hasDeployEndpoint,
  selectAppById,
  selectEnvironmentById,
  selectFirstEndpointByAppId,
  selectLatestDeployOp,
} from "@app/deploy";
import { environmentAppsUrl } from "@app/routes";
import { AppState } from "@app/types";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

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
  const vhost = useSelector((s: AppState) =>
    selectFirstEndpointByAppId(s, { id: appId }),
  );
  const deployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId }),
  );
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );

  return (
    <StatusBox>
      <div className="border-b border-black-100 pb-4 ">
        <div className="flex items-center">
          <div>
            <img
              alt="default project logo"
              src="/resource-types/logo-app.png"
              style={{ width: 32, height: 32 }}
              className="mr-3"
            />
          </div>
          <div>
            <h4 className={tokens.type.h4}>{handle}</h4>
            <p className="text-black-500 text-sm">
              {hasDeployEndpoint(vhost) && vhost.status === "provisioned" ? (
                <a
                  href={`https://${vhost.virtualDomain}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  https://{vhost.virtualDomain}
                </a>
              ) : (
                "Pending HTTP Endpoint"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center mt-1 gap-1">
          {status}

          <Pill icon={<IconGlobe color="#595E63" variant="sm" />}>
            <Link to={environmentAppsUrl(environment.id)}>
              {env.handle}
            </Link>
          </Pill>

          <Pill icon={<IconGitBranch color="#595E63" variant="sm" />}>
            {deployOp.gitRef.slice(0, 7) || "Pending"}
          </Pill>
        </div>
      </div>

      {children}
    </StatusBox>
  );
};
