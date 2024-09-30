import { fetchMembershipsByRole } from "@app/auth";
import {
  deriveEnvPermInheritance,
  getUpdatePermId,
  hasExplicitPerm,
  hasInheritedPerm,
  isPhiAllowed,
  scopeTitle,
  selectCanUserManageRole,
  selectEnvironmentsByOrgAsList,
  selectPermsByEnvAndRoleId,
  updatePerm,
} from "@app/deploy";
import { resetLoaderByIds } from "@app/loaders";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useSelector } from "@app/react";
import { useQuery } from "@app/react";
import { getIsOwnerRole, selectRoleById } from "@app/roles";
import { environmentDetailUrl } from "@app/routes";
import { schema } from "@app/schema";
import type { DeployEnvironment, Permission } from "@app/types";
import { selectCurrentUserId } from "@app/users";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { RoleDetailLayout } from "../layouts";
import {
  BannerMessagesBasic,
  Button,
  ButtonCanManageRole,
  EmptyTr,
  Group,
  Input,
  InputSearch,
  PermCheck,
  Pill,
  RoleColHeader,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tr,
} from "../shared";

function ScopeToggle({
  checked,
  disabled,
  onToggle,
  isLoading,
  label,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: (c: boolean) => void;
  isLoading: boolean;
  label: string;
}) {
  return (
    <label>
      <div className="text-xs mb-2 h-[30px] flex justify-center items-end">
        {label}
      </div>
      <Input
        type="checkbox"
        className="rounded-lg w-6 h-6"
        onChange={(ev) => onToggle(ev.currentTarget.checked)}
        checked={checked}
        disabled={disabled || isLoading}
      />
    </label>
  );
}

function EnvEditorRow({
  roleId,
  env,
  editing = false,
  onEdit = () => {},
  disabled = false,
}: {
  roleId: string;
  env: DeployEnvironment;
  editing?: boolean;
  onEdit?: (id: string) => void;
  disabled?: boolean;
}) {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const orgId = useSelector(selectOrganizationSelectedId);
  const canManage = useSelector((s) =>
    selectCanUserManageRole(s, { roleId, userId, orgId }),
  );
  const updateLoader = useSelector((s) =>
    schema.loaders.selectById(s, { id: getUpdatePermId(roleId) }),
  );
  const envPerms = useSelector((s) =>
    selectPermsByEnvAndRoleId(s, { envId: env.id, roleId }),
  );
  const perms = deriveEnvPermInheritance(envPerms);
  const calcToggle = (
    perm: Permission,
  ): { checked: boolean; disabled: boolean } => {
    if (hasExplicitPerm(perm)) {
      return { checked: true, disabled: !canManage };
    }

    if (hasInheritedPerm(perm)) {
      return { checked: true, disabled: true };
    }

    return { checked: false, disabled: !canManage };
  };
  const onToggle = (perm: Permission) => {
    return (checked: boolean) => {
      if (checked) {
        dispatch(
          updatePerm({
            type: "add",
            payload: {
              envId: env.id,
              roleId,
              scope: perm.scope,
            },
          }),
        );
      } else {
        dispatch(updatePerm({ type: "rm", payload: { id: perm.id, roleId } }));
      }
    };
  };

  return (
    <Tr>
      <Td className="min-w-[130px]">
        <div>
          <Link to={environmentDetailUrl(env.id)}>{env.handle}</Link>
        </div>
        <Group size="xs">
          <div>{env.totalAppCount} Apps</div>
          <div>{env.totalDatabaseCount} Databases</div>
        </Group>
      </Td>
      <Td variant="center" className="min-w-[130px]">
        {isPhiAllowed(env) ? (
          <Pill variant="success">Allowed</Pill>
        ) : (
          <Pill variant="error">Not Allowed</Pill>
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.admin}
            onToggle={onToggle(perms.admin)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.admin)}
          />
        ) : (
          <PermCheck perm={perms.admin} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.read}
            onToggle={onToggle(perms.read)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.read)}
          />
        ) : (
          <PermCheck perm={perms.read} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.basic_read}
            onToggle={onToggle(perms.basic_read)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.basic_read)}
          />
        ) : (
          <PermCheck perm={perms.basic_read} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.deploy}
            onToggle={onToggle(perms.deploy)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.deploy)}
          />
        ) : (
          <PermCheck perm={perms.deploy} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.destroy}
            onToggle={onToggle(perms.destroy)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.destroy)}
          />
        ) : (
          <PermCheck perm={perms.destroy} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.observability}
            onToggle={onToggle(perms.observability)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.observability)}
          />
        ) : (
          <PermCheck perm={perms.observability} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.sensitive}
            onToggle={onToggle(perms.sensitive)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.sensitive)}
          />
        ) : (
          <PermCheck perm={perms.sensitive} />
        )}
      </Td>
      <Td variant="center">
        {editing ? (
          <ScopeToggle
            label={scopeTitle.tunnel}
            onToggle={onToggle(perms.tunnel)}
            isLoading={updateLoader.isLoading}
            {...calcToggle(perms.tunnel)}
          />
        ) : (
          <PermCheck perm={perms.tunnel} />
        )}
      </Td>
      <Td variant="right">
        <div className="max-h-full">
        {editing ? (
          <Button size="sm" variant="white" onClick={() => onEdit("")}>
            Done
          </Button>
        ) : (
          <ButtonCanManageRole
            userId={userId}
            roleId={roleId}
            orgId={orgId}
            size="sm"
            onClick={() => onEdit(env.id)}
            disabled={disabled}
          >
            Edit
          </ButtonCanManageRole>
        )}
        </div>
      </Td>
    </Tr>
  );
}

function EnvironmentTableEditor({
  roleId,
  envs,
}: { roleId: string; envs: DeployEnvironment[] }) {
  const [editingEnvId, setEditingEnvId] = useState("");
  return (
    <Table className="flex-1">
      <THead>
        <Th>Environment</Th>
        <Th>PHI</Th>
        <RoleColHeader scope="admin" />
        <RoleColHeader scope="read" />
        <RoleColHeader scope="basic_read" />
        <RoleColHeader scope="deploy" />
        <RoleColHeader scope="destroy" />
        <RoleColHeader scope="observability" />
        <RoleColHeader scope="sensitive" />
        <RoleColHeader scope="tunnel" />
        <Th variant="right">Actions</Th>
      </THead>

      <TBody>
        {envs.length === 0 ? (
          <EmptyTr colSpan={10}>No environments exist</EmptyTr>
        ) : null}
        {envs.map((env) => {
          return (
            <EnvEditorRow
              key={env.id}
              roleId={roleId}
              env={env}
              disabled={editingEnvId !== ""}
              editing={editingEnvId === env.id}
              onEdit={setEditingEnvId}
            />
          );
        })}
      </TBody>
    </Table>
  );
}

export function RoleDetailEnvironmentsPage() {
  const { id = "" } = useParams();
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  useQuery(fetchMembershipsByRole({ roleId: id }));
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const envs = allEnvs
    .filter((env) => {
      const srch = search.toLocaleLowerCase();
      const handle = env.handle.toLocaleLowerCase();

      const idMatch = env.id === srch;
      const handleMatch = handle.includes(srch);
      return handleMatch || idMatch;
    })
    .sort((a, b) => a.handle.localeCompare(b.handle));
  const loaderId = getUpdatePermId(id);
  const updateLoader = useSelector((s) =>
    schema.loaders.selectById(s, { id: loaderId }),
  );
  const role = useSelector((s) => selectRoleById(s, { id }));

  useEffect(() => {
    dispatch(resetLoaderByIds({ ids: [loaderId] }));
  }, []);

  const isOwnerRole = getIsOwnerRole(role);
  if (isOwnerRole) {
    return <RoleDetailLayout>Cannot edit {role.type} role</RoleDetailLayout>;
  }

  return (
    <RoleDetailLayout>
      <Group className="mt-4">
        <Group
          variant="horizontal"
          size="sm"
          className="items-center justify-between"
        >
          <InputSearch
            placeholder="Search..."
            search={search}
            onChange={onChange}
          />
          <BannerMessagesBasic
            {...updateLoader}
            message={
              updateLoader.isLoading
                ? "Updating permissions ..."
                : updateLoader.message
            }
          />
        </Group>
        <EnvironmentTableEditor roleId={id} envs={envs} />
      </Group>
    </RoleDetailLayout>
  );
}
