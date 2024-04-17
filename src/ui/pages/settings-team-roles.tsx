import { fetchMembershipsByOrgId, selectUsersByRoleId } from "@app/auth";
import { prettyDate } from "@app/date";
import {
  selectEnvToPermsByRoleId,
  selectEnvironmentsByOrgAsList,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useQuery, useSelector } from "@app/react";
import { selectRolesByOrgIdWithSearch } from "@app/roles";
import {
  roleDetailEnvironmentsUrl,
  roleDetailUrl,
  settingsUrl,
  teamRolesUrl,
} from "@app/routes";
import { Role } from "@app/types";
import { Link } from "react-router-dom";
import {
  Breadcrumbs,
  ButtonLink,
  Group,
  Pill,
  TBody,
  THead,
  Table,
  Td,
  Tr,
  tokens,
} from "../shared";

export const TeamRolesPage = () => {
  const orgId = useSelector(selectOrganizationSelectedId);
  const roles = useSelector((s) =>
    selectRolesByOrgIdWithSearch(s, { orgId, search: "" }),
  );
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);

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

      <div className="text-gray-500">{`${roles.length} Roles`}</div>
      <Table>
        <THead>
          <Td>Role</Td>
          <Td>Members</Td>
          <Td>Environments with permissions</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => {
            return (
              <RoleTableRow
                key={role.id}
                role={role}
                numEnvs={allEnvs.length}
              />
            );
          })}
        </TBody>
      </Table>
    </Group>
  );
};

export const RoleTableRow = ({
  role,
  numEnvs,
}: { role: Role; numEnvs: number }) => {
  const users = useSelector((s) => selectUsersByRoleId(s, { roleId: role.id }));
  const userNames = users.map((u) => u.name).join(", ");
  const envToPerms = useSelector((s) =>
    selectEnvToPermsByRoleId(s, { roleId: role.id }),
  );
  const numPerms = Object.keys(envToPerms).length;

  let defaultPill = false;
  if (
    role.type === "owner" ||
    role.type === "platform_owner" ||
    role.type === "compliance_owner"
  ) {
    defaultPill = true;
  }
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
        {defaultPill ? (
          <Pill variant="progress">Default</Pill>
        ) : (
          <Pill>Custom</Pill>
        )}
      </Td>
      <Td className="align-baseline">
        <div>{users.length > 0 ? userNames : "No users"}</div>
      </Td>
      <Td className="min-w-[45ch] align-baseline">
        <div>
          {role.type === "owner" ? (
            "All Environments and Billing"
          ) : role.type === "platform_owner" ? (
            "All Environments"
          ) : (
            <Link to={roleDetailEnvironmentsUrl(role.id)}>
              {`${numPerms} / ${numEnvs} Environments`}
            </Link>
          )}
        </div>
      </Td>
      <Td variant="right">
        <ButtonLink to={roleDetailUrl(role.id)} size="sm">
          Edit
        </ButtonLink>
      </Td>
    </Tr>
  );
};
