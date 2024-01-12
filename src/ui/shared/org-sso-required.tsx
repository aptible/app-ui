import {
  selectOrganizationSelected,
  selectOrganizationsAsList,
} from "@app/organizations";
import { useSelector } from "@app/react";
import { ssoDirectUrl } from "@app/routes";
import { selectIsAuthWithSso } from "@app/token";
import { Link } from "react-router-dom";
import { Banner } from "./banner";

export function OrgSsoRequired() {
  const allOrgs = useSelector(selectOrganizationsAsList);
  const org = useSelector(selectOrganizationSelected);
  const isAuthWithSso = useSelector(selectIsAuthWithSso);

  if (isAuthWithSso) return null;
  if (allOrgs.length > 1) return null;
  if (!org.ssoEnforced) return null;

  return (
    <Banner variant="error">
      <div>Organization {org.name} requires SSO!</div>
      <div>
        <Link to={ssoDirectUrl(org.id)} className="text-white underline">
          Please log in using SSO.
        </Link>
      </div>
    </Banner>
  );
}
