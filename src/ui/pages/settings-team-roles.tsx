import { fetchMembershipsByOrgId, selectUsersByRoleId } from "@app/auth";
import { prettyDate } from "@app/date";
import {
  selectEnvToPermsByRoleId,
  selectEnvironmentById,
  selectEnvironmentsByOrgAsList,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { getIsOwnerRole, selectRolesByOrgId } from "@app/roles";
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
  Pill,
  Select,
  TBody,
  THead,
  Table,
  Td,
  Tr,
  tokens,
} from "../shared";

export const TeamRolesPage = () => {
  const orgId = useSelector(selectOrganizationSelectedId);
  const users = useSelector(selectUsersAsList);
  const usersAsOptions = [
    { label: "All", value: "" },
    ...users.map((user) => ({ label: user.name, value: user.id })),
  ];
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const envsAsOptions = [
    { label: "Hide No-Access Environments", value: "no-access" },
    { label: "All Environments", value: "all" },
    ...allEnvs.map((env) => ({ label: env.handle, value: env.id })),
  ];
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));
  const rolesAsOptions = [
    { label: "All", value: "" },
    ...roles.map((role) => ({
      label: role.name,
      value: role.id,
    })),
  ];
  const [roleFilter, setRoleFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [envFilter, setEnvFilter] = useState("no-access");

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
                  value={memberFilter}
                  options={usersAsOptions}
                  onSelect={(opt) => setMemberFilter(opt.value)}
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
                <Button variant="white">Reset</Button>
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

      <div className="text-gray-500">{`${roles.length} Roles`}</div>

      {roles.map((role) => {
        return <RoleTable role={role} totalEnvs={allEnvs.length} />;
      })}
    </Group>
  );
};

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

function RoleTable({ role, totalEnvs }: { role: Role; totalEnvs: number }) {
  const users = useSelector((s) => selectUsersByRoleId(s, { roleId: role.id }));
  const envToPerms = useSelector((s) =>
    selectEnvToPermsByRoleId(s, { roleId: role.id }),
  );
  const envIds = Object.keys(envToPerms);
  const numEnvs = envIds.length;
  const isOwnerRole = getIsOwnerRole(role);

  // The Deploy Owners has total permission over all of your Deploy platform resources.

  return (
    <Group>
      <Group variant="horizontal">
        <Group className="w-[225px]">
          <RolePill role={role} />

          {users.length === 0 ? <div>No users</div> : null}
          <div>
            {users.map((user) => (
              <div key={user.id}>{user.name}</div>
            ))}
          </div>

          <ButtonLink
            to={roleDetailUrl(role.id)}
            size="sm"
            className="inline-block w-fit"
          >
            Edit
          </ButtonLink>
        </Group>

        {isOwnerRole ? (
          <Box className="flex-1">
            The Account Owners role has total permission over your Aptible
            account.
          </Box>
        ) : (
          <Table className="flex-1">
            <THead>
              <Td>{displayRoleEnvsHeader(role.type, totalEnvs, numEnvs)}</Td>
              <Td>Environment Admin</Td>
              <Td variant="center">Full Visibility</Td>
              <Td variant="center">Basic Visibility</Td>
              <Td variant="center">Deployment</Td>
              <Td variant="center">Destruction</Td>
              <Td variant="center">Ops</Td>
              <Td variant="center">Sensitive Access</Td>
              <Td variant="center">Tunnel</Td>
            </THead>

            <TBody>
              {envIds.map((id) => {
                return (
                  <RoleEnvRow key={id} envId={id} envPerms={envToPerms[id]} />
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
        className={`${tokens.type["table link"]}`}
        to={roleDetailUrl(role.id)}
      >
        <span className="text-base font-semibold">{role.name}</span>
      </Link>

      {defaultPill ? null : (
        <div className="text-gray-500 text-sm">
          Created: {prettyDate(role.createdAt)}
        </div>
      )}

      {defaultPill ? (
        <Pill variant="progress">Default</Pill>
      ) : (
        <Pill>Custom</Pill>
      )}
    </div>
  );
}
