import { useSelector } from "@app/react";
import {
  impersonateUrl,
  logoutUrl,
  settingsUrl,
  ssoTokenUrl,
} from "@app/routes";
import { selectIsAuthWithSso } from "@app/token";
import { selectCanImpersonate } from "@app/users";
import { useCurrentUser } from "../hooks";
import { IconKey, IconLogout, IconSettings } from "./icons";
import { IconAlertCircle } from "./icons";
import { LinkNav } from "./link";
import { Loading } from "./loading";

export const UserMenu = ({ hideName = false }: { hideName?: boolean }) => {
  const [user, loader] = useCurrentUser();
  const isAuthWithSso = useSelector(selectIsAuthWithSso);

  const canImpersonate = useSelector(selectCanImpersonate);

  if (loader.isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full mb-2">
      <LinkNav
        to={settingsUrl()}
        icon={<IconSettings />}
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
