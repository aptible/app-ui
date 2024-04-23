import { fetchMembershipsByOrgId, selectRoleToUsersMap } from "@app/auth";
import {
  deprovisionEnvironment,
  fetchBackupsByEnvironmentId,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  fetchEnvironmentById,
  selectBackupsByEnvId,
  selectEnvironmentById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  selectPermsByEnvId,
  updateEnvironmentName,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { getIsOwnerRole, selectRolesByOrgId } from "@app/roles";
import { environmentsUrl, roleDetailUrl } from "@app/routes";
import { PermissionScope, Role, User } from "@app/types";
import { handleValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  ButtonAdmin,
  ButtonDestroy,
  CheckBox,
  Code,
  FormGroup,
  IconAlertTriangle,
  IconTrash,
  Input,
  PermCheck,
  RoleColHeader,
  TBody,
  THead,
  Table,
  Td,
  Th,
  Tooltip,
  Tr,
  tokens,
} from "../shared";

const validators = {
  handle: handleValidator,
};

const EnvChangeName = ({ envId }: { envId: string }) => {
  const dispatch = useDispatch();
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));

  const [confirm, setConfirm] = useState(false);
  const [handle, setHandle] = useState<string>("");
  const [errors, validate] = useValidator<string, typeof validators>(
    validators,
  );
  const action = updateEnvironmentName({ id: envId, handle });
  const loader = useLoader(action);
  const invalid = !confirm;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(handle)) return;
    dispatch(action);
  };

  useEffect(() => {
    setHandle(env.handle);
  }, [env.id]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormGroup
        label="Environment Handle"
        htmlFor="env-handle"
        feedbackMessage={errors.handle}
        feedbackVariant={errors.handle ? "danger" : "info"}
      >
        <Input
          id="env-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
        />
      </FormGroup>

      <div className="flex flex-col gap-4">
        <Banner variant="info">
          <div className="mb-1 font-semibold">
            In order for the new environment handle {handle} to appear in log
            drain and metric drain destinations, you must restart the apps and
            databases in this environment. Also be aware the following may need
            adjustments:
          </div>
          <ol className="list-disc list-inside">
            <li>
              Git remote URLs (e.g.:{" "}
              <Code>git@beta.aptible.com:{handle}/APP_HANDLE.git</Code>)
            </li>
            <li>Your own external scripts (e.g. for CI/CD)</li>
          </ol>
        </Banner>

        <CheckBox
          label="I understand the warning above"
          checked={confirm}
          onChange={(e) => setConfirm(e.currentTarget.checked)}
        />

        <BannerMessages {...loader} />

        <hr />

        <ButtonAdmin
          envId={envId}
          type="submit"
          isLoading={loader.isLoading}
          disabled={invalid}
          className="w-40"
        >
          Save Changes
        </ButtonAdmin>
      </div>
    </form>
  );
};

const EnvDestroy = ({ envId }: { envId: string }) => {
  const navigate = useNavigate();
  useQuery(fetchEnvironmentById({ id: envId }));
  useQuery(
    fetchBackupsByEnvironmentId({ id: envId, orphaned: false, page: 1 }),
  );
  useQuery(fetchEnvLogDrains({ id: envId }));
  useQuery(fetchEnvMetricDrains({ id: envId }));

  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const metricDrains = useSelector((s) =>
    selectMetricDrainsByEnvId(s, { envId }),
  );
  const logDrains = useSelector((s) => selectLogDrainsByEnvId(s, { envId }));
  const backups = useSelector((s) => selectBackupsByEnvId(s, { envId }));

  const [confirm, setConfirm] = useState("");
  const dispatch = useDispatch();
  const action = deprovisionEnvironment({ id: envId });
  const loader = useLoader(action);
  const invalid = confirm !== env.handle;
  const calcErrors = () => {
    const errs = [];
    if (env.totalAppCount > 0) {
      errs.push("Apps");
    }
    if (env.totalDatabaseCount > 0) {
      errs.push("Databases");
    }
    if (backups.length > 0) {
      errs.push("Database Backups");
    }
    if (logDrains.length > 0) {
      errs.push("Log Drains");
    }
    if (metricDrains.length > 0) {
      errs.push("Metric Drains");
    }

    return errs;
  };
  const errs = calcErrors();
  const canDeprovision = errs.length === 0;
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (invalid || !canDeprovision) return;
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(environmentsUrl());
  });

  return (
    <Box>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Deprovision Environment
      </h1>

      <form onSubmit={onSubmit}>
        <div>
          This will permanently deprovision <strong>{env.handle}</strong>{" "}
          environment. This action cannot be undone. If you want to proceed,
          type <strong>{env.handle}</strong> below to continue.
        </div>

        {canDeprovision ? null : (
          <Banner className="mt-4" variant="error">
            You must first deprovision any existing{" "}
            <strong>{errs.join(", ")}</strong> inside your{" "}
            <strong>{env.handle}</strong> environment to proceed.
          </Banner>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Input
            name="delete-confirm"
            className="flex-1"
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <ButtonDestroy
            type="submit"
            envId={envId}
            variant="delete"
            isLoading={loader.isLoading}
            disabled={invalid || !canDeprovision}
            className="h-full w-70 flex"
          >
            <IconTrash color="#FFF" className="mr-2" />
            Deprovision Environment
          </ButtonDestroy>
        </div>
      </form>
    </Box>
  );
};

function EnvPermsRow({
  envId,
  role,
  users,
}: { envId: string; role: Role; users: User[] }) {
  const envPerms = useSelector((s) => selectPermsByEnvId(s, { envId }));
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
        <Tooltip text={users.map((u) => u.name).join(", ")}>
          <Code>{users.length}</Code>
        </Tooltip>
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

function EnvPerms({ envId, orgId }: { envId: string; orgId: string }) {
  const roles = useSelector((s) => selectRolesByOrgId(s, { orgId }));
  const roleToUserMap = useSelector(selectRoleToUsersMap);
  useQuery(fetchMembershipsByOrgId({ orgId }));

  return (
    <div>
      <h3 className="text-lg text-gray-500 mb-4">Permissions</h3>
      <Table>
        <THead>
          <Th>Role</Th>
          <Th>Members</Th>
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
              envId={envId}
              users={roleToUserMap[role.id]}
            />
          ))}
        </TBody>
      </Table>
    </div>
  );
}

export const EnvironmentSettingsPage = () => {
  const { id = "" } = useParams();
  const orgId = useSelector(selectOrganizationSelectedId);

  return (
    <div className="flex flex-col gap-4">
      <Box>
        <h1 className="text-lg text-gray-500 mb-4">Environment Settings</h1>
        <EnvChangeName envId={id} />
      </Box>

      <EnvPerms envId={id} orgId={orgId} />
      <EnvDestroy envId={id} />
    </div>
  );
};
