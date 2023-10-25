import { selectEnv } from "@app/env";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  securitySettingsUrl,
  settingsProfileUrl,
  sshSettingsUrl,
} from "@app/routes";
import cn from "classnames";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { IconExternalLink, IconLock } from "./icons";
import { tokens } from "./tokens";
import { Tooltip } from "./tooltip";

const active = "bg-off-white font-semibold text-black focus:text-black";
const inactive = "text-black-500 hover:bg-black-50 hover:text-black";
const navButton =
  "group flex items-center p-2 text-base rounded-md hover:no-underline";

export function SettingsSidebar() {
  const env = useSelector(selectEnv);
  const url = (slug: string) => `${env.legacyDashboardUrl}${slug}`;
  const orgId = useSelector(selectOrganizationSelectedId);

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <nav className="flex flex-col">
      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Account Settings</h4>

        <NavLink className={navLink} to={settingsProfileUrl()}>
          Profile
        </NavLink>

        <NavLink className={navLink} to={securitySettingsUrl()}>
          Security
          <Tooltip text="Reauthentication Required" fluid>
            <IconLock variant="sm" className="ml-1 opacity-60" />
          </Tooltip>
        </NavLink>

        <NavLink className={navLink} to={sshSettingsUrl()}>
          SSH Keys
          <Tooltip text="Reauthentication Required" fluid>
            <IconLock variant="sm" className="ml-1 opacity-60" />
          </Tooltip>
        </NavLink>

        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Team</h4>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/members`)}
          target="_blank"
        >
          Members
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/roles`)}
          target="_blank"
        >
          Roles
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/pending-invitations`)}
          target="_blank"
        >
          Pending Invites
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/single-sign-on`)}
          target="_blank"
        >
          Single Sign-On
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/adming/contact-settings`)}
          target="_blank"
        >
          Contacts
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>

        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Billing</h4>

        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/admin/billing/invoices`)}
          target="_blank"
        >
          Dashboard{" "}
          <IconExternalLink variant="sm" className="ml-1 opacity-60" />
        </NavLink>
      </div>
    </nav>
  );
}
