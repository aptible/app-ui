import { selectOrganizationSelectedId } from "@app/organizations";
import {
  securitySettingsUrl,
  settingsProfileUrl,
  sshSettingsUrl,
  teamContactsUrl,
  teamMembersUrl,
  teamPendingInvitesUrl,
  teamRolesUrl,
  teamSsoUrl,
} from "@app/routes";
import cn from "classnames";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { ExternalLink } from "./external-link";
import { IconExternalLink } from "./icons";
import { tokens } from "./tokens";

export function SettingsSidebar() {
  const orgId = useSelector(selectOrganizationSelectedId);
  const accountNav = [
    { name: "Profile", to: settingsProfileUrl() },
    { name: "Security", to: securitySettingsUrl() },
    { name: "SSH Keys", to: sshSettingsUrl() },
  ];

  const companyNav = [
    { name: "Roles", to: teamRolesUrl() },
    { name: "Members", to: teamMembersUrl() },
    { name: "Pending Invites", to: teamPendingInvitesUrl() },
    { name: "Single Sign-On", to: teamSsoUrl() },
    { name: "Contacts", to: teamContactsUrl() },
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
            {item.name}
          </NavLink>
        ))}
        <hr className="mt-3 mx-2" />
      </div>

      <div>
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Legacy UI</h4>
        <ExternalLink
          className="group flex items-center p-2 text-base rounded-md hover:no-underline text-black-500 hover:bg-black-50 hover:text-black gap-2"
          variant="info"
          href={"https://dashboard.aptible.com/settings/profile"}
        >
          Profile <IconExternalLink variant="sm" />
        </ExternalLink>
        <ExternalLink
          className="group flex items-center p-2 text-base rounded-md hover:no-underline text-black-500 hover:bg-black-50 hover:text-black gap-2"
          variant="info"
          href={`https://dashboard.aptible.com/organizations/${orgId}/members`}
        >
          Team <IconExternalLink variant="sm" />
        </ExternalLink>
        <ExternalLink
          className="group flex items-center p-2 text-base rounded-md hover:no-underline text-black-500 hover:bg-black-50 hover:text-black gap-2"
          variant="info"
          href={`https://dashboard.aptible.com/organizations/${orgId}/admin/billing/invoices`}
        >
          Billing <IconExternalLink variant="sm" />
        </ExternalLink>
      </div>
    </nav>
  );
}
