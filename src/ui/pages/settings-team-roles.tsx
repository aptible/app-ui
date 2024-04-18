import { fetchMembershipsByOrgId, selectUsersByRoleId } from "@app/auth";
import { prettyDate } from "@app/date";
import {
  selectEnvToPermsByRoleId,
  selectEnvironmentById,
  selectEnvironmentsByOrgAsList,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { selectRolesByOrgId } from "@app/roles";
import {
  roleDetailUrl,
  settingsUrl,
  teamRolesCreateUrl,
  teamRolesUrl,
} from "@app/routes";
import { Permission, PermissionScope, Role, RoleType } from "@app/types";
import { selectUsersAsList } from "@app/users";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  ButtonIcon,
  ButtonLink,
  Group,
  IconCheckCircle,
  IconDownload,
  IconPlusCircle,
  IconX,
  Label,
  Select,
  SelectOption,
  TBody,
  THead,
  Table,
  Td,
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
  const orgId = useSelector(selectOrganizationSelectedId);
  const users = useSelector(selectUsersAsList);
  const usersAsOptions = [
    { label: "All", value: FILTER_ALL },
    ...users
      .map((user) => ({ label: user.name, value: user.id }))
      .sort(sortOpts),
  ];
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const envsAsOptions = [
    { label: "Hide No-Access Environments", value: FILTER_NO_ACCESS },
    { label: "All Environments", value: FILTER_ALL },
    ...allEnvs
      .map((env) => ({ label: env.handle, value: env.id }))
      .sort(sortOpts),
  ];
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));
  const rolesAsOptions = [
    { label: "All", value: FILTER_ALL },
    ...roles
      .map((role) => ({
        label: role.name,
        value: role.id,
      }))
      .sort(sortOpts),
  ];
  const [roleFilter, setRoleFilter] = useState(FILTER_ALL);
  const [userFilter, setUserFilter] = useState(FILTER_ALL);
  const [envFilter, setEnvFilter] = useState(FILTER_NO_ACCESS);
  const filters: RoleFilters = {
    roleId: roleFilter,
    userId: userFilter,
    envId: envFilter,
  };
  const filteredRoles = roles.filter((role) => {
    if (isAll(filters.roleId)) return true;
    return role.id === filters.roleId;
  });
  const onReset = () => {
    setRoleFilter(FILTER_ALL);
    setUserFilter(FILTER_ALL);
    setEnvFilter(FILTER_NO_ACCESS);
  };

  useQuery(fetchMembershipsByOrgId({ orgId }));

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
        <form>
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
                <Button>Save Filters</Button>
                <Button variant="white" onClick={onReset}>
                  Reset
                </Button>
              </Group>

              <Group variant="horizontal" size="sm">
                <ButtonIcon icon={<IconDownload variant="sm" />}>
                  CSV
                </ButtonIcon>
                <ButtonLink to={teamRolesCreateUrl()}>
                  <IconPlusCircle variant="sm" className="mr-2" /> New Role
                </ButtonLink>
              </Group>
            </Group>
          </Group>
        </form>
      </Box>

      <div className="text-gray-500">{`${filteredRoles.length} Roles`}</div>

      {filteredRoles.map((role) => {
        return (
          <RoleTable role={role} totalEnvs={allEnvs.length} filters={filters} />
        );
      })}
    </Group>
  );
};

const filterEnv = (
  envId: RoleFilters["envId"],
  envToPerms: { [key: string]: Permission[] },
): { [key: string]: Permission[] } => {
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
};

function RoleTable({
  role,
  totalEnvs,
  filters,
}: { role: Role; totalEnvs: number; filters: RoleFilters }) {
  const users = useSelector((s) => selectUsersByRoleId(s, { roleId: role.id }));
  const filteredUsers = users.filter((u) => {
    if (isAll(filters.userId)) {
      return true;
    }
    return u.id === filters.userId;
  });
  const envToPerms = useSelector((s) =>
    selectEnvToPermsByRoleId(s, { roleId: role.id }),
  );
  const filtered = filterEnv(filters.envId, envToPerms);
  const envIds = Object.keys(filtered);
  const numEnvs = envIds.length;

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

          {filteredUsers.length === 0 ? <div>No users</div> : null}
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

        {role.type === "owner" ? (
          <Box className="flex-1 flex justify-center items-center flex-col">
            <IconCheckCircle className="mb-2" color="#00633F" />
            <h3 className={tokens.type.h3}>Full Access and Billing Access</h3>
            <div>
              The Account Owners role has total permission over your Aptible
              account and manage billing.
            </div>
          </Box>
        ) : role.type === "platform_owner" ? (
          <Box className="flex-1 flex justify-center items-center flex-col">
            <IconCheckCircle className="mb-2" color="#00633F" />
            <h3 className={tokens.type.h3}>Full Access</h3>
            <div>
              The Deploy Owners role total permission over all of your Deploy
              platform resources.
            </div>
          </Box>
        ) : (
          <Table className="flex-1">
            <THead>
              <Td>{displayRoleEnvsHeader(role.type, totalEnvs, numEnvs)}</Td>
              <Td className="w-[100px] text-center">Environment Admin</Td>
              <Td className="w-[100px] text-center" variant="center">
                Full Visibility
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Basic Visibility
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Deployment
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Destruction
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Ops
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Sensitive Access
              </Td>
              <Td className="w-[100px] text-center" variant="center">
                Tunnel
              </Td>
            </THead>

            <TBody>
              {envIds.map((id) => {
                return (
                  <RoleEnvRow key={id} envId={id} envPerms={filtered[id]} />
                );
              })}
            </TBody>
          </Table>
        )}
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

function PermCheck({ checked }: { checked: boolean }) {
  if (checked) {
    return <IconCheckCircle className="inline-block" color="#00633F" />;
  }
  return <IconX className="inline-block" color="#AD1A1A" />;
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
