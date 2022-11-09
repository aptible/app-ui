import { logoutUrl, securitySettingsUrl, sshSettingsUrl } from "@app/routes";

import { useCurrentUser } from "../hooks";

import { tokens } from "./tokens";
import { Link } from "react-router-dom";

export const UserMenu = () => {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return <>Loading...</>;
  }

  return (
    <div>
      <div className="px-4 py-2">
        <p className={tokens.type["small semibold darker"]}>{user.name}</p>
        <p className={tokens.type["small lighter"]}>{user.email}</p>
      </div>
      <div>
        <Link to={sshSettingsUrl()}>SSH Keys</Link>
      </div>
      <div>
        <Link to={securitySettingsUrl()}>Security Settings</Link>
      </div>
      <div>
        <Link to={logoutUrl()}>Logout</Link>
      </div>
    </div>
  );
};
