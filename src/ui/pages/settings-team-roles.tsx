import { fetchMembershipsByOrgId, selectRoleToUsersMap } from "@app/auth";
import { prettyDate } from "@app/date";
import {
  selectEnvironmentById,
  selectEnvironments,
  selectEnvironmentsByOrgAsList,
  selectRoleToEnvToPermsMap,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { getIsOwnerRole, selectRolesByOrgId } from "@app/roles";
import {
  roleDetailUrl,
  settingsUrl,
  teamRolesCreateUrl,
  teamRolesUrl,
} from "@app/routes";
import { Permission, PermissionScope, Role, RoleType, User } from "@app/types";
import { selectUsersAsList } from "@app/users";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  ButtonLink,
  CsvButton,
  EmptyTr,
  Group,
  IconPlusCircle,
  Label,
  PermCheck,
  RoleColHeader,
  Select,
  SelectOption,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
  tokens,
} from "../shared";

interface RoleFilters {
  roleId: string;
  userId: string;
  envId: string;
}

const sortOpts = (a: SelectOption<string>, b: SelectOption<string>) =>
  a.label.localeCompare(b.label);
const FILTER_NO_ACCESS = "no-access";
const isNoAccess = (envId: string) => envId === FILTER_NO_ACCESS;
const FILTER_ALL = "all";
const isAll = (id: string) => id === FILTER_ALL;

export const TeamRolesPage = () => {
  const [params, setParams] = useSearchParams();
  const org = useSelector(selectOrganizationSelected);
  const envs = useSelector(selectEnvironments);
  const roleToUserMap = useSelector(selectRoleToUsersMap);
  const roleToEnvToPermsMap = useSelector(selectRoleToEnvToPermsMap);
  const users = useSelector(selectUsersAsList);
  const usersAsOptions = [
    { label: "All", value: FILTER_ALL },
    ...users
      .map((user) => ({ label: user.name, value: user.id }))
      .sort(sortOpts),
  ];
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const envsAsOptions = [
    { label: "Hide Environments without Permissions", value: FILTER_NO_ACCESS },
    { label: "All Environments", value: FILTER_ALL },
    ...allEnvs
      .map((env) => ({ label: env.handle, value: env.id }))
      .sort(sortOpts),
  ];
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId: org.id }));
  const rolesAsOptions = [
    { label: "All", value: FILTER_ALL },
    ...roles
      .map((role) => ({
        label: role.name,
        value: role.id,
      }))
      .sort(sortOpts),
  ];
  const roleId = params.get("role_id") || FILTER_ALL;
  const userId = params.get("user_id") || FILTER_ALL;
  const envId = params.get("environment_id") || FILTER_NO_ACCESS;
  const filters = {
    roleId,
    userId,
    envId,
  };
  const [roleFilter, setRoleFilter] = useState(roleId);
  const [userFilter, setUserFilter] = useState(userId);
  const [envFilter, setEnvFilter] = useState(envId);
  const filteredRoles = roles.filter((role) => {
    if (isAll(filters.roleId)) return true;
    return role.id === filters.roleId;
  });
  const ownerRole = filteredRoles.find((role) => role.type === "owner");
  const deployRole = filteredRoles.find(
    (role) => role.type === "platform_owner",
  );
  const onFilter = () => {
    setParams({
      role_id: roleFilter,
      user_id: userFilter,
      environment_id: envFilter,
    });
  };
  const onReset = () => {
    setRoleFilter(FILTER_ALL);
    setUserFilter(FILTER_ALL);
    setEnvFilter(FILTER_NO_ACCESS);
    setParams({});
  };
  const onCsv = (): string => {
    const scopePrint =
      (roleType: RoleType, perms: Permission[]) => (scope: PermissionScope) => {
        if (roleType === "owner" || roleType === "platform_owner") {
          return "Yes";
        }
        return perms.find((perm) => perm.scope === scope) ? "Yes" : "No";
      };
    let csv =
      "organization,role,users,environment,environment_admin,full_visibility,basic_visibility,deployment,destroy,ops,sensitive_access,tunnel\n";

    for (const role of filteredRoles) {
      const roleUsers = roleToUserMap[role.id].filter(
        filterUsers(filters.userId),
      );
      const envToPerms = filterEnv(filters.envId, roleToEnvToPermsMap[role.id]);
      const envIds = Object.keys(envToPerms);
      const userDoesNotHaveRole =
        roleUsers.findIndex((u) => u.id === filters.userId) === -1;

      if (!isAll(filters.userId) && userDoesNotHaveRole) {
        continue;
      }

      if (getIsOwnerRole(role)) {
        const cells: string[] = [
          org.name,
          role.name,
          `\"${roleUsers.map((u) => u.name).join(",")}\"`,
          "All Environments",
          "Yes",
          "Yes",
          "Yes",
          "Yes",
          "Yes",
          "Yes",
          "Yes",
          "Yes",
        ];
        csv += cells.join(",");
        csv += "\n";
      } else {
        for (const envId of envIds) {
          const perms = envToPerms[envId];
          const printer = scopePrint(role.type, perms);
          const cells: string[] = [
            org.name,
            role.name,
            `\"${roleUsers.map((u) => u.name).join(",")}\"`,
            envs[envId].handle,
            printer("admin"),
            printer("read"),
            printer("basic_read"),
            printer("deploy"),
            printer("destroy"),
            printer("observability"),
            printer("sensitive"),
            printer("tunnel"),
          ];
          csv += cells.join(",");
          csv += "\n";
        }
      }
    }
    return csv;
  };

  useQuery(fetchMembershipsByOrgId({ orgId: org.id }));

  return (
    <Group>
      <Breadcrumbs
        crumbs={[
          {
            name: "Settings",
            to: settingsUrl(),
          },
          {
            name: "Roles",
            to: teamRolesUrl(),
          },
        ]}
      />

      <Box>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onFilter();
          }}
        >
          <Group>
            <Group variant="horizontal">
              <div className="flex-1">
                <Label htmlFor="role-selector">Roles</Label>
                <Select
                  id="role-selector"
                  value={roleFilter}
                  options={rolesAsOptions}
                  onSelect={(opt) => setRoleFilter(opt.value)}
                  className="w-full"
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="member-selector">Members</Label>
                <Select
                  id="member-selector"
                  value={userFilter}
                  options={usersAsOptions}
                  onSelect={(opt) => setUserFilter(opt.value)}
                  className="w-full"
                />
              </div>

              <div className="flex-1">
                <Label htmlFor="env-selector">Environments</Label>
                <Select
                  id="env-selector"
                  options={envsAsOptions}
                  value={envFilter}
                  onSelect={(opt) => setEnvFilter(opt.value)}
                  className="w-full"
                />
              </div>
            </Group>

            <hr />

            <Group
              variant="horizontal"
              className="items-center justify-between"
            >
              <Group variant="horizontal" size="sm">
                <Button type="submit">Save Filters</Button>
                <Button variant="white" onClick={onReset}>
                  Reset
                </Button>
              </Group>

              <Group variant="horizontal" size="sm">
                <CsvButton csv={onCsv} title={`aptible-roles-${org.name}`} />
                <ButtonLink to={teamRolesCreateUrl()}>
                  <IconPlusCircle variant="sm" className="mr-2" /> New Role
                </ButtonLink>
              </Group>
            </Group>
          </Group>
        </form>
      </Box>

      <div className="text-gray-500">{`${filteredRoles.length} Roles`}</div>

      {ownerRole || deployRole ? (
        <Group variant="horizontal">
          {ownerRole ? (
            <OwnerCard
              title="Account Owner"
              desc="The Account Owners role has total permission over your Aptible account and manage billing."
              users={roleToUserMap[ownerRole.id]}
              roleId={ownerRole.id}
              filters={filters}
            />
          ) : null}

          {deployRole ? (
            <OwnerCard
              title="Deploy Owner"
              desc="The Deploy Owners role total permission over all of your Deploy platform resources."
              users={roleToUserMap[deployRole.id]}
              roleId={deployRole.id}
              filters={filters}
            />
          ) : null}
        </Group>
      ) : null}

      <hr />

      {filteredRoles
        .filter((role) => !getIsOwnerRole(role))
        .map((role) => {
          return (
            <RoleTable
              key={role.id}
              role={role}
              totalEnvs={allEnvs.length}
              filters={filters}
              users={roleToUserMap[role.id]}
              envToPerms={roleToEnvToPermsMap[role.id]}
            />
          );
        })}
    </Group>
  );
};

function OwnerCard({
  roleId,
  title,
  desc,
  users,
  filters,
}: {
  roleId: string;
  title: string;
  desc: string;
  users: User[];
  filters: RoleFilters;
}) {
  const filteredUsers = users
    .filter(filterUsers(filters.userId))
    .map((u) => u.name);

  if (filteredUsers.length === 0) {
    return null;
  }

  return (
    <Box bg="gray-50" className="flex-1 flex flex-col gap-2">
      <h3 className={tokens.type.h3}>{title}</h3>
      <p className="text-black-500">{desc}</p>
      <p>{filteredUsers.join(", ")}</p>
      <ButtonLink
        to={roleDetailUrl(roleId)}
        size="sm"
        className="inline-block w-fit"
      >
        Edit Role
      </ButtonLink>
    </Box>
  );
}

function RoleTable({
  role,
  totalEnvs,
  filters,
  envToPerms,
  users,
}: {
  role: Role;
  totalEnvs: number;
  filters: RoleFilters;
  users: User[];
  envToPerms: { [key: string]: Permission[] };
}) {
  const filteredUsers = users.filter(filterUsers(filters.userId));
  const filtered = filterEnv(filters.envId, envToPerms);
  const envIds = Object.keys(filtered);
  const numEnvs = envIds.reduce((acc, envId) => {
    if (filtered[envId].length > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);
  const userDoesNotHaveRole =
    users.findIndex((u) => u.id === filters.userId) === -1;
  if (!isAll(filters.userId) && userDoesNotHaveRole) {
    return null;
  }

  return (
    <Group>
      <Group variant="horizontal">
        <Group size="sm" className="w-[225px]">
          <RolePill role={role} />

          {filteredUsers.length === 0 ? (
            <div className="text-sm">No users</div>
          ) : null}
          <div>
            {filteredUsers.map((user) => (
              <div key={user.id} className="text-sm">
                {user.name}
              </div>
            ))}
          </div>

          <ButtonLink
            to={roleDetailUrl(role.id)}
            size="sm"
            className="inline-block w-fit"
          >
            Edit Role
          </ButtonLink>
        </Group>

        <Table className="flex-1">
          <THead>
            <Th>{displayRoleEnvsHeader(role.type, totalEnvs, numEnvs)}</Th>
            <RoleColHeader scope="admin" />
            <RoleColHeader scope="read" />
            <RoleColHeader scope="basic_read" />
            <RoleColHeader scope="deploy" />
            <RoleColHeader scope="destroy" />
            <RoleColHeader scope="observability" />
            <RoleColHeader scope="sensitive" />
            <RoleColHeader scope="tunnel" />
          </THead>

          <TBody>
            {envIds.length === 0 ? (
              <EmptyTr colSpan={9}>No permissions set</EmptyTr>
            ) : null}
            {envIds.map((id) => {
              return <RoleEnvRow key={id} envId={id} envPerms={filtered[id]} />;
            })}
          </TBody>
        </Table>
      </Group>

      <hr />
    </Group>
  );
}

function RoleEnvRow({
  envId,
  envPerms,
}: { envId: string; envPerms: Permission[] }) {
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const perms = envPerms.reduce(
    (acc, perm) => {
      acc[perm.scope] = true;
      return acc;
    },
    {
      admin: false,
      read: false,
      basic_read: false,
      deploy: false,
      destroy: false,
      observability: false,
      sensitive: false,
      tunnel: false,
      unknown: false,
    } as Record<PermissionScope, boolean>,
  );
  return (
    <Tr>
      <Td>{env.handle}</Td>
      <Td variant="center">
        <PermCheck checked={perms.admin} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.read} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.basic_read} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.deploy} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.destroy} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.observability} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.sensitive} />
      </Td>
      <Td variant="center">
        <PermCheck checked={perms.tunnel} />
      </Td>
    </Tr>
  );
}

function filterEnv(
  envId: RoleFilters["envId"],
  envToPerms: { [key: string]: Permission[] },
): { [key: string]: Permission[] } {
  if (isAll(envId)) {
    return envToPerms;
  }

  if (isNoAccess(envId)) {
    const filtered: { [key: string]: Permission[] } = {};
    Object.keys(envToPerms).forEach((envId) => {
      if (envToPerms[envId].length > 0) {
        filtered[envId] = envToPerms[envId];
      }
    });
    return filtered;
  }

  return { [envId]: envToPerms[envId] || [] };
}

function filterUsers(filteredUserId: string) {
  return (u: User) => {
    if (isAll(filteredUserId)) return true;
    return u.id === filteredUserId;
  };
}

function displayRoleEnvsHeader(
  roleType: RoleType,
  numEnvs: number,
  numPerms: number,
) {
  if (roleType === "owner") {
    return "All Environments and Billing";
  }

  if (roleType === "platform_owner") {
    return "All Environments";
  }

  return `${numPerms} / ${numEnvs} Environments`;
}

function RolePill({ role }: { role: Role }) {
  let defaultPill = false;
  if (
    role.type === "owner" ||
    role.type === "platform_owner" ||
    role.type === "compliance_owner"
  ) {
    defaultPill = true;
  }

  return (
    <div>
      <Link
        className={`${tokens.type["table link"]} text-md font-semibold`}
        to={roleDetailUrl(role.id)}
      >
        {role.name}
      </Link>

      {defaultPill ? null : (
        <div className="text-gray-500 text-sm">
          Created: {prettyDate(role.createdAt)}
        </div>
      )}
    </div>
  );
}
