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
import { environmentsUrl } from "@app/routes";
import { handleValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  ButtonAdmin,
  ButtonDestroy,
  CheckBox,
  Code,
  EnvPerms,
  FormGroup,
  IconAlertTriangle,
  IconTrash,
  Input,
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
