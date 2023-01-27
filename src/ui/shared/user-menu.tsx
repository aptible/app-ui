import { logoutUrl, settingsUrl, teamUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { Loading } from "./loading";
import { Cogs8Tooth, Info, Logout, UserCircle } from "./icons";
import { LinkNav } from "./link";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <LinkNav to={settingsUrl()} icon={<UserCircle />} name={user.email} />
      <LinkNav to={teamUrl()} icon={<Cogs8Tooth />} name="Team Settings" />
      <LinkNav to={settingsUrl()} icon={<Info />} name="Billing" />
      <LinkNav to={logoutUrl()} icon={<Logout />} name="Logout" />
    </div>
  );
};
