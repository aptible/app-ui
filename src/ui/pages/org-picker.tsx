import { fetchReauthOrganizations, logout } from "@app/auth";
import { refreshData } from "@app/bootup";
import { batchActions } from "@app/fx";
import { useQuery } from "@app/fx";
import {
  selectOrganizationSelectedId,
  selectOrganizationsAsList,
} from "@app/organizations";
import { loginUrl, ssoUrl } from "@app/routes";
import { Organization } from "@app/types";
import { selectCurrentUserId, updateUserOrg } from "@app/users";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { AppSidebarLayout } from "../layouts";
import { Group, Pill, tokens } from "../shared";

const OrgItem = ({
  org,
  selected = false,
  onClick,
}: {
  org: Organization;
  selected?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      onKeyUp={onClick}
      role="button"
      className="my-2 p-4 border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-black-50"
    >
      <div>{org.name}</div>
      <Group size="sm" variant="horizontal" className="items-center">
        {org.ssoEnforced ? <Pill>SSO Enforced</Pill> : null}
        <span>{selected ? "Continue using" : ""}</span>
      </Group>
    </div>
  );
};

export const OrgPickerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const orgId = useSelector(selectOrganizationSelectedId);
  const orgs = useSelector(selectOrganizationsAsList);
  useQuery(fetchReauthOrganizations());
  const orgList = orgs.filter((o) => !o.reauthRequired);
  const reauthOrgs = orgs.filter((o) => o.reauthRequired);
  const onClick = (curOrg: Organization, reauth = false) => {
    if (reauth) {
      dispatch(
        batchActions([updateUserOrg({ userId, orgId: curOrg.id }), logout()]),
      );
      // when sso is required we should send them directly to the SSO page
      if (curOrg.ssoEnforced) {
        navigate(ssoUrl());
      } else {
        navigate(loginUrl());
      }
      return;
    }

    // when we update the user's selected org we need to refetch data
    dispatch(
      batchActions([
        updateUserOrg({ userId, orgId: curOrg.id }),
        refreshData(),
      ]),
    );
  };

  return (
    <AppSidebarLayout>
      <div className="flex flex-col gap-2">
        <h2 className={tokens.type.h2}>Choose Organization</h2>

        <div>
          {orgList.map((o) => {
            return (
              <OrgItem
                key={o.id}
                onClick={() => onClick(o, false)}
                org={o}
                selected={orgId === o.id}
              />
            );
          })}
        </div>

        {reauthOrgs.length > 0 ? (
          <div>
            <div>Reauthentication Required</div>

            {reauthOrgs.map((o) => {
              return (
                <OrgItem key={o.id} onClick={() => onClick(o, true)} org={o} />
              );
            })}
          </div>
        ) : null}
      </div>
    </AppSidebarLayout>
  );
};
