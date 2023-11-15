import { fetchUserRoles, removeUserFromOrg } from "@app/auth";
import { updateUserMemberships } from "@app/auth/membership";
import { selectIsAccountOwner, selectRolesEditable } from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { RoleResponse } from "@app/roles";
import { teamMembersUrl } from "@app/routes";
import { AppState, HalEmbedded } from "@app/types";
import { selectCurrentUser, selectUserById } from "@app/users";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useCache, useLoader, useLoaderSuccess } from "saga-query/react";
import {
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  CheckBox,
  Group,
  tokens,
} from "../shared";

function useFetchUserRoles(userId: string) {
  const rolesLoader = useCache<HalEmbedded<{ roles: RoleResponse[] }>>(
    fetchUserRoles({ userId: userId }),
  );
  const userRoles = rolesLoader.data?._embedded?.roles.map((r) => r.id) || [];
  return { rolesLoader, userRoles };
}

export function TeamMembersEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);
  const currentUser = useSelector(selectCurrentUser);
  const user = useSelector((s: AppState) => selectUserById(s, { id }));
  const roles = useSelector((s: AppState) =>
    selectRolesEditable(s, { orgId: org.id }),
  );
  const { rolesLoader, userRoles } = useFetchUserRoles(user.id);

  useEffect(() => {
    setSelected(userRoles);
  }, [rolesLoader.status]);

  const [selected, setSelected] = useState(userRoles);
  const hasOnlyOneRole = selected.length === 1;
  const onChange = (roleId: string, checked: boolean) => {
    if (checked) {
      const next = [...selected];
      const index = next.findIndex((r) => r === roleId);
      if (index >= 0) {
        // it's already selected so no-op
        return;
      }
      next.push(roleId);
      setSelected(next);
    } else {
      const next = [...selected];
      const index = next.findIndex((r) => r === roleId);
      if (index === -1) {
        // not found so no-op
        return;
      }
      next.splice(index, 1);
      setSelected(next);
    }
  };

  const remove = userRoles.filter(
    (roleId) => selected.includes(roleId) === false,
  );
  const add = selected.filter((roleId) => userRoles.includes(roleId) === false);
  const action = updateUserMemberships({ userId: user.id, add, remove });
  const loader = useLoader(action);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };
  const rmLoader = useLoader(removeUserFromOrg);
  const onRemoveFromOrg = () => {
    dispatch(removeUserFromOrg({ orgId: org.id, userId: user.id }));
  };
  const isAccountOwner = useSelector((s: AppState) =>
    selectIsAccountOwner(s, { orgId: org.id }),
  );
  const canRemoveUser = isAccountOwner && user.id !== currentUser.id;
  useLoaderSuccess(rmLoader, () => {
    navigate(teamMembersUrl());
  });

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          { name: "Team Members", to: teamMembersUrl() },
          { name: `Edit ${user.name}`, to: null },
        ]}
      />

      <Box>
        <h3 className={tokens.type.h3}>
          Edit roles for {user.name} at {org.name}
        </h3>

        <form onSubmit={onSubmit} className="mt-4">
          <Group>
            <BannerMessages {...loader} />

            {roles
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((role) => {
                const userHasRole = selected.includes(role.id);
                return (
                  <CheckBox
                    name="roles"
                    label={role.name}
                    key={role.id}
                    checked={userHasRole}
                    onChange={(e) => onChange(role.id, e.currentTarget.checked)}
                    disabled={userHasRole && hasOnlyOneRole}
                  />
                );
              })}

            <div>
              <Button type="submit" isLoading={loader.isLoading}>
                Save
              </Button>
            </div>
          </Group>
        </form>
      </Box>

      {canRemoveUser ? (
        <Box>
          <Group>
            <BannerMessages {...rmLoader} />

            <h3 className={tokens.type.h3}>
              Remove {user.name} from {org.name}
            </h3>

            <div>
              <Button variant="delete" onClick={onRemoveFromOrg} requireConfirm>
                Remove from {org.name}
              </Button>
            </div>
          </Group>
        </Box>
      ) : null}
    </Group>
  );
}
