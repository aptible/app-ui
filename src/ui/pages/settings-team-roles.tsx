import { fetchMembershipsByOrgId, selectUsersByRoleId } from "@app/auth";
import { prettyDate } from "@app/date";
import {
  selectEnvironmentsByOrgAsList,
  selectFormattedPermissionsByRoleAndAccount,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useLoader, useQuery, useSelector } from "@app/react";
import { createRoleForOrg, selectRolesByOrgIdWithSearch } from "@app/roles";
import { roleDetailEnvironmentsUrl, roleDetailUrl } from "@app/routes";
import { Role } from "@app/types";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BannerMessages,
  Box,
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

  const perms = useSelector((s) =>
    selectFormattedPermissionsByRoleAndAccount(s, { envs: allEnvs }),
  );

  useQuery(fetchMembershipsByOrgId({ orgId }));

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
          <Td>Environments with permissions</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => {
            return (
              <RoleTableRow
                key={role.id}
                role={role}
                perms={perms}
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
  perms,
  numEnvs,
}: { role: Role; perms: any; numEnvs: number }) => {
  const users = useSelector((s) => selectUsersByRoleId(s, { roleId: role.id }));
  const userNames = users.map((u) => u.name).join(", ");
  const numbOfEnvsWithPerms = perms[role.id]
    ? Object.keys(perms[role.id]).length
    : 0;

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
              {`${numbOfEnvsWithPerms} / ${numEnvs} Environments`}
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
