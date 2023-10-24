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
import { IconExternalLink } from "./icons";
import { tokens } from "./tokens";

export function SettingsSidebar() {
  const env = useSelector(selectEnv);
  const url = (slug: string) => `${env.legacyDashboardUrl}${slug}`;

  const orgId = useSelector(selectOrganizationSelectedId);
  const accountNav = [
    { name: "Profile", to: settingsProfileUrl() },
    { name: "Security", to: securitySettingsUrl() },
    { name: "SSH Keys", to: sshSettingsUrl() },
  ];

  const companyNav = [
    { name: "Roles", to: url(`/organizations/${orgId}/roles`) },
    { name: "Members", to: url(`/organizations/${orgId}/members`) },
    {
      name: "Pending Invites",
      to: url(`/organizations/${orgId}/pending-invitations`),
    },
    {
      name: "Single Sign-On",
      to: url(`/organizations/${orgId}/single-sign-on`),
    },
    {
      name: "Contacts",
      to: url(`/organizations/${orgId}/adming/contact-settings`),
    },
  ];

  const active = "bg-off-white font-semibold text-black focus:text-black";
  const inactive = "text-black-500 hover:bg-black-50 hover:text-black";
  const navButton =
    "group flex items-center p-2 text-base rounded-md hover:no-underline";

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(navButton, { [inactive]: !isActive, [active]: isActive });

  return (
    <nav className="flex flex-col">
      <div>
        <h4 className={`${tokens.type.h4} ml-2`}>Account Settings</h4>
        {accountNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}
          </NavLink>
        ))}
        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Team</h4>
        {companyNav.map((item) => (
          <NavLink className={navLink} to={item.to} key={item.to}>
            {item.name}{" "}
            {item.to.startsWith("http") ? (
              <IconExternalLink variant="sm" className="ml-2" />
            ) : null}
          </NavLink>
        ))}
        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Billing</h4>
        <NavLink
          className={navLink}
          to={url(`/organizations/${orgId}/admin/billing/invoices`)}
        >
          Dashboard <IconExternalLink variant="sm" className="ml-2" />
        </NavLink>
      </div>
    </nav>
  );
}
