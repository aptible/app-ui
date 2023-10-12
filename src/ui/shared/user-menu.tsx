import { selectLegacyDashboardUrl } from "@app/env";
import { selectOrganizationSelectedId } from "@app/organizations";
import { impersonateUrl, logoutUrl, ssoTokenUrl } from "@app/routes";
import { selectIsAuthWithSso } from "@app/token";
import { selectCanImpersonate } from "@app/users";
import { useSelector } from "react-redux";
import { useCurrentUser } from "../hooks";
import { IconKey, IconLogout, IconUserCircle } from "./icons";
import { IconAlertCircle } from "./icons";
import { LinkNav } from "./link";
import { Loading } from "./loading";

export const UserMenu = ({ hideName = false }: { hideName?: boolean }) => {
  const [user, loader] = useCurrentUser();
  const legacyUrl = useSelector(selectLegacyDashboardUrl);
  const isAuthWithSso = useSelector(selectIsAuthWithSso);
  const orgId = useSelector(selectOrganizationSelectedId);

  const canImpersonate = useSelector(selectCanImpersonate);

  if (loader.isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full mb-2">
      <LinkNav
        to={`${legacyUrl}/organizations/${orgId}/members`}
        icon={<IconUserCircle />}
        name="Settings"
        hideName={hideName}
      />
      {canImpersonate ? (
        <LinkNav
          to={impersonateUrl()}
          icon={<IconAlertCircle />}
          name="Impersonate"
          hideName={hideName}
        />
      ) : null}
      {isAuthWithSso ? (
        <LinkNav
          to={ssoTokenUrl()}
          name="CLI SSO Token"
          hideName={hideName}
          icon={<IconKey />}
        />
      ) : null}
      <LinkNav
        to={logoutUrl()}
        icon={<IconLogout />}
        name="Logout"
        hideName={hideName}
      />
    </div>
  );
};
