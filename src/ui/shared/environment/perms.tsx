import { fetchMembershipsByOrgId, selectRoleToUsersMap } from "@app/auth";
import { selectPermsByEnvId } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { fetchRoles, getIsOwnerRole, selectRolesByOrgId } from "@app/roles";
import { roleDetailUrl } from "@app/routes";
import { Permission, PermissionScope, Role, User } from "@app/types";
import { Link } from "react-router-dom";
import { Code } from "../code";
import { PermCheck, RoleColHeader } from "../role";
import { TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";
import { Tooltip } from "../tooltip";

export function EnvPerms({ envId, orgId }: { envId: string; orgId: string }) {
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));
  const roleToUserMap = useSelector(selectRoleToUsersMap);
  useQuery(fetchMembershipsByOrgId({ orgId }));
  useQuery(fetchRoles({ orgId }));
  const envPerms = useSelector((s) => selectPermsByEnvId(s, { envId }));

  return (
    <div>
      <h3 className="text-lg text-gray-500 mb-4">Permissions</h3>
      <Table>
        <THead>
          <Th>Role</Th>
          <Th variant="center">Members</Th>
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
          {roles.map((role) => (
            <EnvPermsRow
              key={role.id}
              role={role}
              envPerms={envPerms}
              users={roleToUserMap[role.id]}
            />
          ))}
        </TBody>
      </Table>
    </div>
  );
}

function EnvPermsRow({
  envPerms,
  role,
  users,
}: { envPerms: Permission[]; role: Role; users: User[] }) {
  const filtered = envPerms.filter((p) => p.roleId === role.id);
  const isOwnerRole = getIsOwnerRole(role);
  const perms = filtered.reduce(
    (acc, perm) => {
      acc[perm.scope] = true;
      return acc;
    },
    {
      admin: isOwnerRole,
      read: isOwnerRole,
      basic_read: isOwnerRole,
      deploy: isOwnerRole,
      destroy: isOwnerRole,
      observability: isOwnerRole,
      sensitive: isOwnerRole,
      tunnel: isOwnerRole,
      unknown: isOwnerRole,
    } as Record<PermissionScope, boolean>,
  );
  return (
    <Tr>
      <Td>
        <Link to={roleDetailUrl(role.id)} className={tokens.type["table link"]}>
          {role.name}
        </Link>
      </Td>
      <Td variant="center">
        {users.length === 0 ? (
          <Code>0</Code>
        ) : (
          <Tooltip text={users.map((u) => u.name).join(", ")}>
            <Code>{users.length}</Code>
          </Tooltip>
        )}
      </Td>
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
