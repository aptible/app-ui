import {
  hasOrganization,
  selectOrganizationSelected,
  selectOrganizationsAsList,
} from "@app/organizations";
import { useSelector } from "@app/react";
import { orgPickerUrl, ssoDirectUrl } from "@app/routes";
import { selectIsAuthWithSso } from "@app/token";
import { Link } from "react-router-dom";
import { Banner } from "./banner";

export function OrgRequirements() {
  const allOrgs = useSelector(selectOrganizationsAsList);
  const org = useSelector(selectOrganizationSelected);
  const isAuthWithSso = useSelector(selectIsAuthWithSso);

  if (!hasOrganization(org)) {
    return (
      <Banner variant="error">
        <div>No Organization selected</div>
        <div>
          <Link to={orgPickerUrl()} className="text-white underline">
            Select an Organization
          </Link>
        </div>
      </Banner>
    );
  }

  if (isAuthWithSso) return null;
  if (allOrgs.length > 1) return null;
  if (!org.ssoEnforced) return null;

  return (
    <Banner variant="error">
      <div>SSO Login Required</div>
      <div>Organization {org.name} requires SSO!</div>
      <div>
        <Link to={ssoDirectUrl(org.id)} className="text-white underline">
          Login
        </Link>
      </div>
    </Banner>
  );
}
