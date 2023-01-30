import { logoutUrl, settingsUrl, teamUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { Loading } from "./loading";
import { IconCogs8Tooth, IconInfo, IconLogout, IconUserCircle } from "./icons";
import { LinkNav } from "./link";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <LinkNav to={settingsUrl()} icon={<IconUserCircle />} name={user.email} />
      <LinkNav to={teamUrl()} icon={<IconCogs8Tooth />} name="Team Settings" />
      <LinkNav to={settingsUrl()} icon={<IconInfo />} name="Billing" />
      <LinkNav to={logoutUrl()} icon={<IconLogout />} name="Logout" />
    </div>
  );
};
