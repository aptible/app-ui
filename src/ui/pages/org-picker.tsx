import { useDispatch, useSelector } from "react-redux";
import { batchActions } from "saga-query";
import { useQuery } from "saga-query/react";

import { fetchReauthOrganizations, logout } from "@app/auth";
import {
  selectOrganizationSelected,
  selectOrganizationsAsList,
} from "@app/organizations";
import { Organization } from "@app/types";
import { selectCurrentUserId, updateUserOrg } from "@app/users";

import { MenuWrappedPage } from "../layouts";
import { tokens } from "../shared";

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
      className="my-2 p-4 border border-gray-200 rounded-lg flex items-center justify-between cursor-pointer hover:bg-black-50"
    >
      <span>{org.name}</span>
      <span>{selected ? "Continue using" : ""}</span>
    </div>
  );
};

export const OrgPickerPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const org = useSelector(selectOrganizationSelected);
  const orgs = useSelector(selectOrganizationsAsList);
  useQuery(fetchReauthOrganizations());
  const orgList = orgs.filter((o) => !o.reauthRequired);
  const reauth = orgs.filter((o) => o.reauthRequired);
  const onClick = (orgId: string, reauth = false) => {
    if (reauth) {
      dispatch(batchActions([updateUserOrg({ userId, orgId }), logout()]));
      return;
    }

    dispatch(updateUserOrg({ userId, orgId }));
  };

  return (
    <MenuWrappedPage>
      <div className="flex flex-col gap-2">
        <h1 className={tokens.type.h1}>Choose Organization</h1>

        <div>
          {orgList.map((o) => {
            return (
              <OrgItem
                key={o.id}
                onClick={() => onClick(o.id, false)}
                org={o}
                selected={org.id === o.id}
              />
            );
          })}
        </div>

        {reauth.length > 0 ? (
          <div>
            <div>Reauthentication Required</div>

            {reauth.map((o) => {
              return (
                <OrgItem
                  key={o.id}
                  onClick={() => onClick(o.id, true)}
                  org={o}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </MenuWrappedPage>
  );
};
