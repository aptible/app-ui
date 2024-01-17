import { prettyDate } from "@app/date";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useLoader, useSelector } from "@app/react";
import {
  createRoleForOrg,
  roleTypeFormat,
  selectRolesByOrgId,
} from "@app/roles";
import { roleDetailUrl } from "@app/routes";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BannerMessages,
  Box,
  ButtonLink,
  ButtonOrgOwner,
  FormGroup,
  Group,
  IconPlusCircle,
  Input,
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
  const orgId = useSelector(selectOrganizationSelectedId);
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));

  return (
    <Group>
      <TitleBar description="Roles define the level of access users have within your team">
        Roles
      </TitleBar>

      <Box>
        <CreateRole orgId={orgId} />
      </Box>

      <Table>
        <THead>
          <Td>Role</Td>
          <Td>Type</Td>
          <Td>Created Date</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => (
            <Tr key={role.id}>
              <Td>
                <Link
                  className={`${tokens.type["table link"]}`}
                  to={roleDetailUrl(role.id)}
                >
                  {" "}
                  {role.name}
                </Link>
              </Td>
              <Td>{roleTypeFormat(role)}</Td>
              <Td>{prettyDate(role.createdAt)}</Td>
              <Td variant="right">
                <ButtonLink to={roleDetailUrl(role.id)} size="sm">
                  Edit
                </ButtonLink>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};
