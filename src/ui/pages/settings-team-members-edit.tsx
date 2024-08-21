import { removeUserFromOrg } from "@app/auth";
import { updateUserMemberships } from "@app/auth/membership";
import { selectIsAccountOwner, selectRolesEditable } from "@app/deploy";
import { resetOtp } from "@app/mfa";
import { selectOrganizationSelected } from "@app/organizations";
import {
  useCache,
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useSelector,
} from "@app/react";
import { fetchUserRoles } from "@app/roles";
import { teamMembersUrl } from "@app/routes";
import { selectCurrentUser, selectUserById } from "@app/users";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  const rolesLoader = useCache(fetchUserRoles({ userId: userId }));
  const userRoles = rolesLoader.data?._embedded?.roles.map((r) => r.id) || [];
  return { rolesLoader, userRoles };
}

export function TeamMembersEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const org = useSelector(selectOrganizationSelected);
  const currentUser = useSelector(selectCurrentUser);
  const user = useSelector((s) => selectUserById(s, { id }));
  const roles = useSelector((s) => selectRolesEditable(s, { orgId: org.id }));
  const { rolesLoader, userRoles } = useFetchUserRoles(user.id);
  const curRoleIds = [...userRoles].sort().join(",");

  useEffect(() => {
    setSelected(userRoles);
  }, [curRoleIds]);

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
  const canUpdateMemberships = add.length > 0 || remove.length > 0;
  const loader = useLoader(updateUserMemberships);
  useLoaderSuccess(loader, () => {
    rolesLoader.trigger();
  });
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(updateUserMemberships({ userId: user.id, add, remove }));
  };
  const rmAction = removeUserFromOrg({ orgId: org.id, userId: user.id });
  const rmLoader = useLoader(rmAction);
  const onRemoveFromOrg = () => {
    dispatch(rmAction);
  };
  const isAccountOwner = useSelector((s) =>
    selectIsAccountOwner(s, { orgId: org.id }),
  );
  const userIsScimManaged = !!user.externalId && user.externalId.trim() !== "";
  const canRemoveUser =
    isAccountOwner && user.id !== currentUser.id && !userIsScimManaged;

  useLoaderSuccess(rmLoader, () => {
    navigate(teamMembersUrl());
  });
  const canResetOtp = isAccountOwner && user.otpEnabled;
  const otpLoader = useLoader(resetOtp);
  const onResetOtp = () => {
    dispatch(resetOtp({ userId: user.id }));
  };

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          { name: "Members", to: teamMembersUrl() },
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
                const scimText = role.scimCreated
                  ? " (role managed via SCIM Provisioning)"
                  : "";
                return (
                  <CheckBox
                    name="roles"
                    label={role.name + scimText}
                    key={role.id}
                    checked={userHasRole}
                    onChange={(e) => onChange(role.id, e.currentTarget.checked)}
                    disabled={
                      (userHasRole && hasOnlyOneRole) ||
                      (role.scimCreated && userIsScimManaged)
                    }
                  />
                );
              })}

            <div>
              <Button
                type="submit"
                isLoading={loader.isLoading}
                disabled={!canUpdateMemberships}
              >
                Save
              </Button>
            </div>
          </Group>
        </form>
      </Box>

      {canResetOtp ? (
        <Box>
          <Group>
            <BannerMessages {...otpLoader} />

            <h3 className={tokens.type.h3}>Reset 2FA</h3>

            <div>
              Clicking reset will send {user.name} an email with a link through
              which they can complete the reset.
              {user.name}'s 2FA will not be reset until they click the link in
              the email and confirm the reset.
            </div>

            <div>
              <Button
                variant="delete"
                onClick={onResetOtp}
                requireConfirm
                isLoading={otpLoader.isLoading}
              >
                Reset 2FA
              </Button>
            </div>
          </Group>
        </Box>
      ) : null}

      {canRemoveUser ? (
        <Box>
          <Group>
            <BannerMessages {...rmLoader} />

            <h3 className={tokens.type.h3}>
              Remove {user.name} from {org.name}
            </h3>

            <div>
              <Button
                variant="delete"
                onClick={onRemoveFromOrg}
                requireConfirm
                isLoading={rmLoader.isLoading}
              >
                Remove from {org.name}
              </Button>
            </div>
          </Group>
        </Box>
      ) : null}

      {userIsScimManaged ? (
        <Box>
          <Group>
            <BannerMessages {...rmLoader} />

            <h3 className={tokens.type.h3}>
              Remove {user.name} from {org.name}
            </h3>
            <p>
              This user is managed via SCIM Provisioning. Please manage this
              user directly via the connected IDP.
            </p>

            <div>
              <Button variant="delete" requireConfirm disabled={true}>
                Remove from {org.name}
              </Button>
            </div>
          </Group>
        </Box>
      ) : null}
    </Group>
  );
}
