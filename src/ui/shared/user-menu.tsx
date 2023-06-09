import { logoutUrl, settingsUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { IconLogout, IconUserCircle } from "./icons";
import { LinkNav } from "./link";
import { Loading } from "./loading";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <LinkNav to={settingsUrl()} icon={<IconUserCircle />} name="Settings" />
      <LinkNav to={logoutUrl()} icon={<IconLogout />} name="Logout" />
    </div>
  );
};
