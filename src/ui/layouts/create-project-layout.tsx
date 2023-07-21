import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";

import { selectLegacyDashboardUrl, selectOrigin } from "@app/env";
import { selectOrganizationSelected } from "@app/organizations";
import { homeUrl, logoutUrl } from "@app/routes";

import { AptibleLogo } from "../shared";
import { HeroBgLayout } from "./hero-bg-layout";
import { MenuWrappedPage } from "./menu-wrapped-page";

export const CreateProjectLayout = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const origin = useSelector(selectOrigin);
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const org = useSelector(selectOrganizationSelected);

  const orgSettingsUrl = `${legacyUrl}/organizations/${org.id}/members`;
  const sshSettingsUrl = `${legacyUrl}/settings/protected/ssh`;

  if (origin === "nextgen") {
    return (
      <MenuWrappedPage>
        <HeroBgLayout showLogo={false} width="100%">
          <div className="min-h-screen -my-16 pt-16">
            {children ? children : <Outlet />}
          </div>
        </HeroBgLayout>
      </MenuWrappedPage>
    );
  }

  return (
    <>
      <div className="p-6 flex justify-between relative shadow bg-white border-b border-black-50 mb-8">
        <div className="flex">
          <Link to={homeUrl()}>
            <AptibleLogo />
          </Link>
          <div className="ml-5">
            {origin === "app" ? (
              <a href={legacyUrl} rel="noreferrer" className="text-black-500">
                Dashboard
              </a>
            ) : (
              <Link to={homeUrl()} className="text-black-500">
                Dashboard
              </Link>
            )}
            {origin === "app" && (
              <Link to={homeUrl()} className="text-black-500 ml-5">
                Deployments
              </Link>
            )}
          </div>
        </div>

        <div>
          <a
            href={sshSettingsUrl}
            target="_blank"
            className="text-black-500 ml-5"
            rel="noreferrer"
          >
            Manage SSH Keys
          </a>
          <a
            href={orgSettingsUrl}
            target="_blank"
            className="text-black-500 ml-5"
            rel="noreferrer"
          >
            {org.name} Settings
          </a>
          <Link to={logoutUrl()} className="text-black-500 ml-5">
            Logout
          </Link>
        </div>
      </div>

      <HeroBgLayout showLogo={false} width={700}>
        {children ? children : <Outlet />}
      </HeroBgLayout>
    </>
  );
};
