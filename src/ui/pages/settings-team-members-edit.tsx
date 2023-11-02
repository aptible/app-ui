import { removeUserFromOrg } from "@app/auth";
import { updateUserMemberships } from "@app/auth/membership";
import { selectOrganizationSelected } from "@app/organizations";
import { selectCurrentUserRoleIds, selectRolesByOrgId } from "@app/roles";
import { teamMembersUrl } from "@app/routes";
import { AppState } from "@app/types";
import { selectUserById } from "@app/users";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useLoader } from "saga-query/react";
import {
  BannerMessages,
  Box,
  Breadcrumbs,
  Button,
  CheckBox,
  Group,
  tokens,
} from "../shared";

export function TeamMembersEditPage() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);
  const user = useSelector((s: AppState) => selectUserById(s, { id }));
  const roles = useSelector((s: AppState) =>
    selectRolesByOrgId(s, { orgId: org.id }),
  );
  const userRoles = useSelector(selectCurrentUserRoleIds);
  useEffect(() => {
    setSelected(userRoles);
  }, [userRoles]);

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

  const loader = useLoader(updateUserMemberships);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const remove = userRoles.filter(
      (roleId) => selected.includes(roleId) === false,
    );
    const add = selected.filter(
      (roleId) => userRoles.includes(roleId) === false,
    );
    dispatch(updateUserMemberships({ userId: user.id, add, remove }));
  };
  const rmLoader = useLoader(removeUserFromOrg);
  const onRemoveFromOrg = () => {
    dispatch(removeUserFromOrg({ orgId: org.id, userId: user.id }));
  };

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
    </Group>
  );
}
