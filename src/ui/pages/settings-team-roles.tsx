import { prettyDate } from "@app/date";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useLoader, useSelector, useCache } from "@app/react";
import { createRoleForOrg, selectRolesByOrgId } from "@app/roles";
import { roleDetailUrl } from "@app/routes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  selectEnvironmentsByOrgAsList,
  selectPermsByAccountAndRole,
  selectAllPermissions
} from "@app/deploy";
import {
  fetchUsersForRole
} from "@app/roles"
import {
  BannerMessages,
  Box,
  Button,
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
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const allPerms = useSelector(selectAllPermissions);
  
  // console.log(allPerms)
  let permsByRoleId = allPerms.reduce<{ [key: string]: object }>((acc, perm) => {
    let retObj = {...acc}

    if (!retObj[perm.roleId]) retObj[perm.roleId] = {}
    
    if (!retObj[perm.roleId][perm.environmentId]) retObj[perm.roleId][perm.environmentId] = []

    // retObj[perm.roleId] = [...retObj[perm.roleId], perm]

    return retObj
  }, {})
  // console.log(permsByRoleId)
  // let rolesWithEnvironments = roles.reduce<{ [key: string]: object }>((acc, role) => {
  //   let retObj = { ...acc }

  //   if (!retObj[role.id]) {
  //     retObj[role.id] = { ...allEnvs }
  //   }

  //   return retObj
  // }, {})
  // console.log(rolesWithEnvironments)

  let initialAccordionState = roles.reduce<{ [key: string]: boolean }>((acc, role) => {
    acc[role.id] = false;
    return acc;
  }, {});

  useEffect(() => {
    setRolesOpen(initialAccordionState)
  }, [roles])

  interface RolesOpenState {
    [key: string]: boolean;
  }

  const [rolesOpen, setRolesOpen] = useState<RolesOpenState>({})
  return (
    <Group>
      <TitleBar description="Roles define the level of access users have within your team">
        Roles
      </TitleBar>

      <Box>
        <CreateRole orgId={orgId} />
      </Box>

      <div className="text-gray-500">
        {`${roles.length} Roles`}
      </div>
      <Table>
        <THead>
          <Td>Role</Td>
          <Td>Members</Td>
          <Td>Environments and Permissions</Td>
          <Td variant="right">Actions</Td>
        </THead>

        <TBody>
          {roles.map((role) => {
            let numbOfEnvsWithPerms = permsByRoleId[role.id] ? Object.keys(permsByRoleId[role.id]).length : 0

            return (
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
                  <RoleMembershipRow role={role} />
                </Td>
                <Td className="align-baseline">
                  <div>
                    <div>{`${numbOfEnvsWithPerms} / ${allEnvs.length}`} Environments</div>
                    <Button variant="white" size="sm" onClick={() => {
                      setRolesOpen({ ...rolesOpen, [role.id]: !rolesOpen[role.id] })
                    }}>{rolesOpen[role.id] ? 'Hide All' : 'Show All'}</Button>


                    {/* TODO: Create array.filter to only show relevant environments w/ permissions */}
                    {/* TODO: Add a button to show ALL environemtns and environments w/ only permissions (default) */}


                    {rolesOpen[role.id] ? allEnvs.map((env, i) => {
                      return <RoleEnvironmentRow env={env} role={role} key={i} />
                    }) : null}
                  </div>
                </Td>
                <Td variant="right">
                  <ButtonLink to={roleDetailUrl(role.id)} size="sm">
                    Edit
                  </ButtonLink>
                </Td>
              </Tr>
            )
          })}
        </TBody>
      </Table>
    </Group>
  );
};

export const RoleMembershipRow = ({ role }: { role: any }) => {
  // This makes a call per role, which is how deploy-ui did is. I am open to better suggestions.
  const members = useCache(fetchUsersForRole({ roleId: role.id }))?.data?._embedded?.users || []
  const userNames = members.map(obj => obj.name).join(", ");
  return (
    <div className="max-w-[50ch]">
      {members?.length ? userNames : 'No users'}
    </div>
  )
}

export const RoleEnvironmentRow = ({ env, role }: { env: any, role: any }) => {
  const roleId = role.id
  const perms = useSelector((s) =>
    selectPermsByAccountAndRole(s, { envId: env.id, roleId }),
  );


  const permSet = {
    admin: 'Environment Admin',
    read: 'Full Visibility',
    basic_read: "Basic Visibility",
    deploy: "Deployment",
    destroy: "Destruction",
    observability: "Ops",
    sensitive: "Sensitive Access",
    tunnel: "Tunnel"
  };

  const objectNames = perms.map(obj => permSet[obj.scope as keyof typeof permSet]).join(", ");

  return (
    <div className="text-black mb-2 pb-2 pt-2 border-b border-gray-200 last:border-0 last:mb-0">
      {env.handle}
      <div className="text-gray-500 text-sm">
        {perms.length ?
          <div>{objectNames}</div>
          : 'No Access'}
      </div>
    </div>
  )
}
