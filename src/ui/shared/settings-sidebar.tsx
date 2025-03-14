import { selectEnv } from "@app/config";
import { selectIsAccountOwner } from "@app/deploy";
import {
  selectHasBetaFeatures,
  selectHasDiagnosticsPocFeature,
  selectHasManyOrgs,
  selectOrganizationSelectedId,
} from "@app/organizations";
import { useSelector } from "@app/react";
import {
  plansUrl,
  securitySettingsUrl,
  settingsProfileUrl,
  sshSettingsUrl,
  teamContactsUrl,
  teamDiagnosticsIntegrationsUrl,
  teamGithubIntegrationUrl,
  teamMembersUrl,
  teamPendingInvitesUrl,
  teamRolesUrl,
  teamScimUrl,
  teamSsoUrl,
} from "@app/routes";
import cn from "classnames";
import { NavLink } from "react-router-dom";
import { useTrialNotice } from "../hooks/use-trial-notice";
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
  const hasManyOrgs = useSelector(selectHasManyOrgs);
  const isAccountOwner = useSelector((s) => selectIsAccountOwner(s, { orgId }));
  const hasBetaFeatures = useSelector(selectHasBetaFeatures);
  const hasDiagnosticsPoc = useSelector(selectHasDiagnosticsPocFeature);
  const { hasTrialNoPayment } = useTrialNotice();

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
        <h4 className={`${tokens.type.h4} ml-2 mt-4`}>Team Settings</h4>

        <NavLink className={navLink} to={teamMembersUrl()}>
          Members
        </NavLink>

        <NavLink className={navLink} to={teamPendingInvitesUrl()}>
          Pending Invites
        </NavLink>

        <NavLink className={navLink} to={teamRolesUrl()}>
          Roles
        </NavLink>

        {hasBetaFeatures &&
          (isAccountOwner ? (
            <NavLink className={navLink} to={teamGithubIntegrationUrl()}>
              GitHub Integration
            </NavLink>
          ) : (
            <span className={navLink({ isActive: false })}>
              GitHub Integration
              <Tooltip text="Must be account owner" fluid>
                <IconLock variant="sm" className="ml-1 opacity-60" />
              </Tooltip>
            </span>
          ))}

        {isAccountOwner ? (
          <NavLink className={navLink} to={teamSsoUrl()}>
            Single Sign-On
          </NavLink>
        ) : (
          <span className={navLink({ isActive: false })}>
            Single Sign-On
            <Tooltip text="Must be account owner" fluid>
              <IconLock variant="sm" className="ml-1 opacity-60" />
            </Tooltip>
          </span>
        )}

        {isAccountOwner && !hasManyOrgs && !hasTrialNoPayment ? (
          <NavLink className={navLink} to={teamScimUrl()}>
            Provisioning
          </NavLink>
        ) : (
          <span className={navLink({ isActive: false })}>
            Provisioning
            <Tooltip
              text={
                hasTrialNoPayment
                  ? "Feature not available for trial users"
                  : "Must be account owner with a single assigned organization"
              }
              fluid
            >
              <IconLock variant="sm" className="ml-1 opacity-60" />
            </Tooltip>
          </span>
        )}

        {isAccountOwner ? (
          <NavLink className={navLink} to={teamContactsUrl()}>
            Organization Settings
          </NavLink>
        ) : (
          <span className={navLink({ isActive: false })}>
            Organization Settings
            <Tooltip text="Must be account owner" fluid>
              <IconLock variant="sm" className="ml-1 opacity-60" />
            </Tooltip>
          </span>
        )}

        {isAccountOwner ? (
          <NavLink className={navLink} to={plansUrl()}>
            Plans
          </NavLink>
        ) : (
          <span className={navLink({ isActive: false })}>
            Plans
            <Tooltip text="Must be account owner" fluid>
              <IconLock variant="sm" className="ml-1 opacity-60" />
            </Tooltip>
          </span>
        )}

        {(hasBetaFeatures || hasDiagnosticsPoc) && (
          <NavLink className={navLink} to={teamDiagnosticsIntegrationsUrl()}>
            Diagnostics Integrations
          </NavLink>
        )}

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
