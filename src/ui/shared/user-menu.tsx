import { useSelector } from "react-redux";

import { impersonateUrl, logoutUrl, settingsUrl } from "@app/routes";
import { selectCanImpersonate } from "@app/users";

import { useCurrentUser } from "../hooks";

import { IconLogout, IconUserCircle } from "./icons";
import { IconAlertCircle } from "./icons";
import { LinkNav } from "./link";
import { Loading } from "./loading";

export const UserMenu = ({ hideName = false }: { hideName?: boolean }) => {
  const { user, isLoading } = useCurrentUser();
  const canImpersonate = useSelector(selectCanImpersonate);

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full mb-2">
      <LinkNav
        to={settingsUrl()}
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
      <LinkNav
        to={logoutUrl()}
        icon={<IconLogout />}
        name="Logout"
        hideName={hideName}
      />
    </div>
  );
};
