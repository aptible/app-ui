import { useSelector } from "react-redux";

import { impersonateUrl, logoutUrl, settingsUrl } from "@app/routes";
import { selectCanImpersonate } from "@app/users";

import { useCurrentUser } from "../hooks";

import { IconLogout, IconUserCircle } from "./icons";
import { IconAlertCircle } from "./icons";
import { LinkNav } from "./link";
import { Loading } from "./loading";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();
  const canImpersonate = useSelector(selectCanImpersonate);

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <LinkNav to={settingsUrl()} icon={<IconUserCircle />} name="Settings" />
      {canImpersonate ? (
        <LinkNav
          to={impersonateUrl()}
          icon={<IconAlertCircle />}
          name="Impersonate"
        />
      ) : null}
      <LinkNav to={logoutUrl()} icon={<IconLogout />} name="Logout" />
    </div>
  );
};
