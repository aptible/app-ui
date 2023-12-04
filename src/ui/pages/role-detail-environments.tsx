import {
  addPerm,
  deletePerm,
  isPhiAllowed,
  selectCanUserManageRole,
  selectEnvironmentsByOrgAsList,
  selectPermsByAccount,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import { useDispatch, useLoader, useSelector } from "@app/react";
import { environmentDetailUrl } from "@app/routes";
import { defaultPermission } from "@app/schema";
import { DeployEnvironment, Permission, PermissionScope } from "@app/types";
import { selectCurrentUserId } from "@app/users";
import { useParams } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { RoleDetailLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  CheckBox,
  Group,
  IconInfo,
  InputSearch,
  Pill,
  Tooltip,
  tokens,
} from "../shared";

function ScopeToggle({
  scope,
  checked,
  disabled,
  description,
  onToggle,
}: {
  scope: string;
  checked: boolean;
  disabled: boolean;
  description: string;
  onToggle: (c: boolean) => void;
}) {
  return (
    <Group variant="horizontal" size="sm" className="items-center">
      <CheckBox
        label={scope}
        onChange={(ev) => onToggle(ev.currentTarget.checked)}
        checked={checked}
        disabled={disabled}
      />
      <Tooltip text={description} autoSizeWidth variant="left">
        <IconInfo variant="sm" />
      </Tooltip>
    </Group>
  );
}

function RoleEnvEditor({
  env,
  roleId,
}: { env: DeployEnvironment; roleId: string }) {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const orgId = useSelector(selectOrganizationSelectedId);
  const canManage = useSelector((s) =>
    selectCanUserManageRole(s, { roleId, userId, orgId }),
  );
  const addLoader = useLoader(addPerm);
  const delLoader = useLoader(deletePerm);
  const perms = useSelector((s) => selectPermsByAccount(s, { envId: env.id }));
  const permSet: Record<PermissionScope, Permission> = {
    admin: defaultPermission({ scope: "admin" }),
    read: defaultPermission({ scope: "read" }),
    basic_read: defaultPermission({ scope: "basic_read" }),
    deploy: defaultPermission({ scope: "deploy" }),
    destroy: defaultPermission({ scope: "destroy" }),
    observability: defaultPermission({ scope: "observability" }),
    sensitive: defaultPermission({ scope: "sensitive" }),
    tunnel: defaultPermission({ scope: "tunnel" }),
    unknown: defaultPermission(),
  };
  perms.forEach((p) => {
    permSet[p.scope] = p;
  });
  const onToggle = (perm: Permission) => {
    return (checked: boolean) => {
      if (checked) {
        dispatch(
          addPerm({
            envId: env.id,
            roleId,
            scope: perm.scope,
          }),
        );
      } else {
        dispatch(deletePerm({ id: perm.id }));
      }
    };
  };

  const calcToggle = (
    perm: Permission,
  ): { checked: boolean; disabled: boolean } => {
    const derived = { checked: true, disabled: true };
    // admin => everything is checked
    if (permSet.admin.id !== "" && perm.scope !== "admin") {
      return derived;
    }
    // anything check? => basic_read is checked
    if (perms.length > 0 && perm.scope === "basic_read") {
      return derived;
    }

    return { checked: perm.id !== "", disabled: !canManage };
  };

  return (
    <Box>
      <Group variant="horizontal">
        <Group size="sm" className="w-[300px]">
          <h3 className={tokens.type.h3}>
            <Link to={environmentDetailUrl(env.id)}>{env.handle}</Link>
          </h3>
          <Group size="sm">
            <Pill>{isPhiAllowed(env) ? "PHI Allowed" : "PHI Not Allowed"}</Pill>
            <div>{env.totalAppCount} Apps</div>
            <div>{env.totalDatabaseCount} Databases</div>
          </Group>
        </Group>

        <Group size="sm" className="flex-1">
          <h3 className={tokens.type.h3}>Permissions</h3>

          <BannerMessages {...addLoader} />
          <BannerMessages {...delLoader} />

          <Group size="sm">
            <ScopeToggle
              scope="Environment Admin"
              description="Grants Users unrestricted access to the Environment. This includes the ability to see all sensitive values and take any action against any resource in the Environment."
              onToggle={onToggle(permSet.admin)}
              {...calcToggle(permSet.admin)}
            />
            <ScopeToggle
              scope="Full Visibility"
              description="Allows Users to see all information for all of the resources in the Environment including App Configurations. The one exception is Database Credentials which cannot be seen."
              onToggle={onToggle(permSet.read)}
              {...calcToggle(permSet.read)}
            />
            <ScopeToggle
              scope="Basic Visibility"
              description="Allows Users to see basic information for all of the resources in the Environment. It does not allow them to manage the resources or see any sensitive values such as Database Credentials or Configuration values."
              onToggle={onToggle(permSet.basic_read)}
              {...calcToggle(permSet.basic_read)}
            />
            <ScopeToggle
              scope="Deployment"
              description="Allows Users to create and deploy resources in the Environment. This includes actions such as create, deploy, configure, and restart. It does not grant access to read any sensitive values."
              onToggle={onToggle(permSet.deploy)}
              {...calcToggle(permSet.deploy)}
            />
            <ScopeToggle
              scope="Destruction"
              description="Allows Users to destroy every resource in the Environment as well as the Environment itself."
              onToggle={onToggle(permSet.destroy)}
              {...calcToggle(permSet.destroy)}
            />
            <ScopeToggle
              scope="Ops"
              description="Allows Users to create and manage Log and Metric Drains in the Environment. It also allows Users to take actions commonly associated with incident response such as restarting and scaling resources."
              onToggle={onToggle(permSet.observability)}
              {...calcToggle(permSet.observability)}
            />
            <ScopeToggle
              scope="Sensitive Access"
              description="Allows Users to see and manage sensitive values in the Environment such as configuring Apps, viewing Database Credentials, and managing Certificates."
              onToggle={onToggle(permSet.sensitive)}
              {...calcToggle(permSet.sensitive)}
            />
            <ScopeToggle
              scope="Tunnel"
              description="Allows User to tunnel into Databases in the Environment. This permission does not allow Users to see Database Credentials so Users will need to be provided credentials through another channel."
              onToggle={onToggle(permSet.tunnel)}
              {...calcToggle(permSet.tunnel)}
            />
          </Group>
        </Group>
      </Group>
    </Box>
  );
}

export function RoleDetailEnvironmentsPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const allEnvs = useSelector(selectEnvironmentsByOrgAsList);
  const envs = allEnvs.filter((env) => {
    const srch = search.toLocaleLowerCase();
    const handle = env.handle.toLocaleLowerCase();

    const idMatch = env.id === srch;
    const handleMatch = handle.includes(srch);
    return handleMatch || idMatch;
  });

  return (
    <RoleDetailLayout>
      <Group className="mt-2">
        <InputSearch
          placeholder="Search..."
          search={search}
          onChange={onChange}
        />
        <Group>
          {envs.map((env) => {
            return <RoleEnvEditor key={env.id} env={env} roleId={id} />;
          })}
        </Group>
      </Group>
    </RoleDetailLayout>
  );
}
