import { prettyDate } from "@app/date";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { createRoleForOrg, selectRolesByOrgId } from "@app/roles";
import { roleDetailUrl } from "@app/routes";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BannerMessages,
  Box,
  ButtonOrgOwner,
  Group,
  IconPlusCircle,
  Input,
  TBody,
  THead,
  Table,
  Td,
  TitleBar,
  Tr,
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
        <Group variant="horizontal">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter role name"
          />

          <ButtonOrgOwner type="submit" disabled={trimmedName === ""}>
            <IconPlusCircle variant="sm" className="mr-2" /> New Role
          </ButtonOrgOwner>
        </Group>
      </form>
    </Group>
  );
};

export const TeamRolesPage = () => {
  const orgId = useSelector(selectOrganizationSelectedId);
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));

  return (
    <Group>
      <TitleBar description="Role management">Roles</TitleBar>

      <Box>
        <CreateRole orgId={orgId} />
      </Box>

      <Table>
        <THead>
          <Td>Role</Td>
          <Td>Type</Td>
          <Td>Created At</Td>
        </THead>

        <TBody>
          {roles.map((role) => (
            <Tr key={role.id}>
              <Td>
                <Link to={roleDetailUrl(role.id)}> {role.name}</Link>
              </Td>
              <Td>{role.type}</Td>
              <Td>{prettyDate(role.createdAt)}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
