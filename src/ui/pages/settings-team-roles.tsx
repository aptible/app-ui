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
  ButtonLink,
  ButtonOrgOwner,
  FormGroup,
  Group,
  Input,
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
          <Td>Members</Td>
          <Td>Environments and Permissions</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => (
            <Tr key={role.id}>
              <Td className="align-baseline">
                <Link
                  className={`${tokens.type["table link"]}`}
                  to={roleDetailUrl(role.id)}
                >
                  {" "}
                  <span className="text-base font-semibold">{role.name}</span>
                </Link>
                <div className="text-gray-500 text-sm">
                  Created: {prettyDate(role.createdAt)}
                </div>
                <Pill>Custom</Pill>
              </Td>
              <Td className="align-baseline">
                <div className="max-w-[50ch]">
                  Angela Champion, Charles Byram, Danny Vega, Alison Tafel,
                  Kevin Horst, Kyle Coughlin, Angela Champion, Charles Byram,
                  Danny Vega, Alison Tafel, Kevin Horst, Kyle Coughlin
                </div>
              </Td>
              <Td className="align-baseline">
                <div className="text-black mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0">
                  Environment Name
                  <div className="text-gray-500 text-sm">
                    Full Visibility, Environment Admin, Destruction, Ops, Basic
                    Visibility, Sensitive Access, Deployment, Tunnel
                  </div>
                </div>
                <div className="text-black mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0">
                  Environment Name
                  <div className="text-gray-500 text-sm">
                    Full Visibility, Environment Admin, Destruction, Ops, Basic
                    Visibility, Sensitive Access, Deployment, Tunnel
                  </div>
                </div>
                <div className="text-black mb-2 pb-2 border-b border-gray-200 last:border-0 last:mb-0">
                  Environment Name
                  <div className="text-gray-500 text-sm">
                    Full Visibility, Environment Admin, Destruction, Ops, Basic
                    Visibility, Sensitive Access, Deployment, Tunnel
                  </div>
                </div>
              </Td>
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
