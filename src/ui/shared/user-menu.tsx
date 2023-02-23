import { logoutUrl, settingsUrl, teamUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { Loading } from "./loading";
import {
  IconCreditCard,
  IconLogout,
  IconSettings,
  IconUserCircle,
} from "./icons";
import { LinkNav } from "./link";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <div className="w-full">
      <LinkNav
        to={settingsUrl()}
        icon={<IconUserCircle />}
        name="Profile Settings"
      />
      <LinkNav to={teamUrl()} icon={<IconSettings />} name="Team Settings" />
      <LinkNav to={settingsUrl()} icon={<IconCreditCard />} name="Billing" />
      <LinkNav to={logoutUrl()} icon={<IconLogout />} name="Logout" />
    </div>
  );
};
