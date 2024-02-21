import { prettyDate } from "@app/date";
import {
  selectAllPermissions,
  selectEnvironmentsByOrgAsList,
  selectPermsByAccountAndRole,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useCache, useDispatch, useLoader, useSelector } from "@app/react";
import { createRoleForOrg, selectRolesByOrgIdWithSearch } from "@app/roles";
import { fetchUsersForRole } from "@app/roles";
import { roleDetailUrl } from "@app/routes";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BannerMessages,
  Box,
  Button,
  ButtonLink,
  ButtonOrgOwner,
  FormGroup,
  Group,
  Input,
  InputSearch,
  Pill,
  TBody,
  THead,
  Table,
  Td,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

const CreateRole = ({ orgId }: { orgId: string }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const trimmedName = name.trim();
  const loader = useLoader(createRoleForOrg);
  const onCreateRole = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createRoleForOrg({ orgId, name: trimmedName }));
  };
  return (
    <Group>
      <BannerMessages {...loader} />

      <form onSubmit={onCreateRole}>
        <FormGroup label="New Role" htmlFor="role-name">
          <div className="flex gap-2">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter role name"
              name="role-name"
              id="role-name"
              className="flex-1"
            />
            <ButtonOrgOwner type="submit" disabled={trimmedName === ""}>
              Save Role
            </ButtonOrgOwner>
          </div>
        </FormGroup>
      </form>
    </Group>
  );
};

export const TeamRolesPage = () => {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const orgId = useSelector(selectOrganizationSelectedId);
  const roles = useSelector((s) =>
    selectRolesByOrgIdWithSearch(s, { orgId, search }),
  );
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const allPerms = useSelector(selectAllPermissions);

  const allEnvsObj = allEnvs.reduce<{ [key: string]: { [key: string]: any } }>(
    (acc, env) => {
      const retObj: { [key: string]: any } = { ...acc };

      if (!retObj[env.id]) retObj[env.id] = env;

      return retObj;
    },
    {},
  );

  const permsByRoleId = allPerms.reduce<{
    [key: string]: { [key: string]: any };
  }>((acc, perm) => {
    const retObj: { [key: string]: any } = { ...acc };

    if (!retObj[perm.roleId]) retObj[perm.roleId] = {};

    if (!retObj[perm.roleId][perm.environmentId]) {
      retObj[perm.roleId][perm.environmentId] = [
        { ...perm, handle: allEnvsObj[perm.environmentId].handle },
      ];
    } else if (retObj[perm.roleId][perm.environmentId]) {
      retObj[perm.roleId][perm.environmentId] = [
        ...retObj[perm.roleId][perm.environmentId],
        perm,
      ];
    }

    return retObj;
  }, {});

  const initialAccordionState = roles.reduce<{ [key: string]: boolean }>(
    (acc, role) => {
      acc[role.id] = false;
      return acc;
    },
    {},
  );

  useEffect(() => {
    setRolesOpen(initialAccordionState);
  }, [roles]);

  interface RolesOpenState {
    [key: string]: boolean;
  }

  const [rolesOpen, setRolesOpen] = useState<RolesOpenState>({});
  const [allEnvOpen, setAllEnvOpen] = useState<RolesOpenState>({});
  return (
    <Group>
      <TitleBar description="Roles define the level of access users have within your team">
        Roles
      </TitleBar>

      <Box>
        <CreateRole orgId={orgId} />
      </Box>

      <InputSearch
        placeholder="Search roles..."
        search={search}
        onChange={onChange}
      />

      <div className="text-gray-500">{`${roles.length} Roles`}</div>
      <Table>
        <THead>
          <Td>Role</Td>
          <Td>Members</Td>
          <Td>Environments and Permissions</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => {
            const numbOfEnvsWithPerms = permsByRoleId[role.id]
              ? Object.keys(permsByRoleId[role.id]).length
              : 0;
            const environmentsWithPerms = permsByRoleId[role.id];
            return (
              <Tr key={role.id}>
                <Td className="align-baseline">
                  <Link
                    className={`${tokens.type["table link"]}`}
                    to={roleDetailUrl(role.id)}
                  >
                    <span className="text-base font-semibold">{role.name}</span>
                  </Link>
                  <div className="text-gray-500 text-sm">
                    Created: {prettyDate(role.createdAt)}
                  </div>
                  <Pill>Custom</Pill>
                </Td>
                <Td className="align-baseline">
                  <RoleMembershipRow role={role} />
                </Td>
                <Td className="min-w-[75ch]">
                  <div>
                    <div>
                      {`${numbOfEnvsWithPerms} / ${allEnvs.length}`}{" "}
                      Environments
                    </div>
                    <Button
                      variant="white"
                      size="sm"
                      onClick={() => {
                        setRolesOpen({});
                        setAllEnvOpen({
                          ...allEnvOpen,
                          [role.id]: !allEnvOpen[role.id],
                        });
                      }}
                    >
                      {allEnvOpen[role.id] ? "Hide All" : "Show All"}
                    </Button>

                    {/* Leaving functionality for this in just incase we want to reuse this */}
                    {/* {environmentsWithPerms && (
                      <Button
                        variant="white"
                        size="sm"
                        onClick={() => {
                          setAllEnvOpen({});
                          setRolesOpen({
                            ...rolesOpen,
                            [role.id]: !rolesOpen[role.id],
                          });
                        }}
                      >
                        {rolesOpen[role.id]
                          ? "Hide Permissions"
                          : "Show Permissions"}
                      </Button>
                    )} */}

                    {allEnvOpen[role.id]
                      ? allEnvs
                          .sort((a, b) => {
                            if (!environmentsWithPerms) return 0;

                            if (
                              environmentsWithPerms[a.id] &&
                              !environmentsWithPerms[b.id]
                            )
                              return -1;
                            if (
                              environmentsWithPerms[b.id] &&
                              !environmentsWithPerms[a.id]
                            )
                              return 1;
                            if (
                              environmentsWithPerms[a.id] &&
                              environmentsWithPerms[b.id]
                            )
                              return 0;

                            if (
                              environmentsWithPerms[a.id]?.length >
                              environmentsWithPerms[b.id]?.length
                            )
                              return -1;
                            if (
                              environmentsWithPerms[a.id]?.length <
                              environmentsWithPerms[b.id]?.length
                            )
                              return 1;
                            if (
                              environmentsWithPerms[a.id]?.length ===
                              environmentsWithPerms[b.id]?.length
                            )
                              return 0;

                            return 0;
                          })
                          .map((env) => {
                            return (
                              <AllRoleEnvironmentRow
                                env={env}
                                role={role}
                                key={env.id}
                              />
                            );
                          })
                      : null}

                    {rolesOpen[role.id] && environmentsWithPerms
                      ? Object.keys(environmentsWithPerms).map((env) => {
                          return (
                            <RoleEnvironmentRow
                              env={environmentsWithPerms[env]}
                              envHandle={environmentsWithPerms[env][0].handle}
                              role={role}
                              key={env}
                            />
                          );
                        })
                      : null}
                  </div>
                </Td>
                <Td variant="right">
                  <ButtonLink to={roleDetailUrl(role.id)} size="sm">
                    Edit
                  </ButtonLink>
                </Td>
              </Tr>
            );
          })}
        </TBody>
      </Table>
    </Group>
  );
};

export const RoleMembershipRow = ({ role }: { role: any }) => {
  // This makes a call per role, which is how deploy-ui did is. I am open to better suggestions.
  const members =
    useCache(fetchUsersForRole({ roleId: role.id }))?.data?._embedded?.users ||
    [];
  const userNames = members.map((obj) => obj.name).join(", ");
  return (
    <div className="max-w-[40ch]">
      {members?.length ? userNames : "No users"}
    </div>
  );
};

export const RoleEnvironmentRow = ({
  env,
  role,
  envHandle,
}: { env: any; role: any; envHandle: string }) => {
  const perms = env;

  const permSet = {
    admin: "Environment Admin",
    read: "Full Visibility",
    basic_read: "Basic Visibility",
    deploy: "Deployment",
    destroy: "Destruction",
    observability: "Ops",
    sensitive: "Sensitive Access",
    tunnel: "Tunnel",
  };

  const objectNames = perms
    .map((obj: { scope: string }) => permSet[obj.scope as keyof typeof permSet])
    .join(", ");

  return (
    <div className="text-black mb-2 pb-2 pt-2 border-b border-gray-200 last:border-0 last:mb-0">
      {env.handle || envHandle}
      <div className="text-gray-500 text-sm">
        {perms.length ? <div>{objectNames}</div> : "No Access"}
      </div>
    </div>
  );
};
export const AllRoleEnvironmentRow = ({
  env,
  role,
}: { env: any; role: any }) => {
  const roleId = role.id;
  const perms = useSelector((s) =>
    selectPermsByAccountAndRole(s, { envId: env.id, roleId }),
  );

  const permSet = {
    admin: "Environment Admin",
    read: "Full Visibility",
    basic_read: "Basic Visibility",
    deploy: "Deployment",
    destroy: "Destruction",
    observability: "Ops",
    sensitive: "Sensitive Access",
    tunnel: "Tunnel",
  };

  const objectNames = perms
    .map((obj) => permSet[obj.scope as keyof typeof permSet])
    .join(", ");

  return (
    <div className="text-black mb-2 pb-2 pt-2 border-b border-gray-200 last:border-0 last:mb-0">
      {env.handle}
      <div className="text-gray-500 text-sm">
        {perms.length ? <div>{objectNames}</div> : "No Access"}
      </div>
    </div>
  );
};
