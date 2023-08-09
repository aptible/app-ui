import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useLoader, useLoaderSuccess, useQuery } from "saga-query/react";

import {
  deprovisionEnvironment,
  fetchDatabaseBackupsByEnvironment,
  fetchEnvironmentById,
  fetchLogDrains,
  fetchMetricDrains,
  selectBackupsByEnvId,
  selectEnvironmentById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  updateEnvironmentName,
} from "@app/deploy";
import { AppState } from "@app/types";

import { useValidator } from "../hooks";
import {
  Banner,
  Box,
  ButtonCreate,
  ButtonDestroy,
  CheckBox,
  FormGroup,
  IconAlertTriangle,
  IconTrash,
  Input,
} from "../shared";
import { environmentsUrl } from "@app/routes";

const validators = {
  name: (name: string) => {
    if (name.trim() === "") {
      return "Environment cannot be empty";
    }
  },
};

const EnvChangeName = ({ envId }: { envId: string }) => {
  const dispatch = useDispatch();
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );

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
        label="Environment Name"
        htmlFor="env-name"
        feedbackMessage={errors.name}
        feedbackVariant={errors.name ? "danger" : "info"}
      >
        <Input
          id="env-name"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
        />
      </FormGroup>

      <div className="flex flex-col gap-4">
        <Banner variant="warning">
          <div className="mb-1">
            In order for the new environment handle {handle} to appear in log
            drain and metric drain destinations, you must restart the apps and
            databases in this environment. Also be aware the following may need
            adjustments:
          </div>
          <ol className="list-disc list-inside">
            <li>
              Git remote URLs (e.g.:{" "}
              <code>git@beta.aptible.com:{handle}/APP_HANDLE.git</code>)
            </li>
            <li>Your own external scripts (e.g. for CI/CD)</li>
          </ol>
        </Banner>

        <CheckBox
          label="I understand the warning above"
          checked={confirm}
          onChange={(e) => setConfirm(e.currentTarget.checked)}
        />

        <hr />

        <ButtonCreate
          envId={envId}
          type="submit"
          isLoading={loader.isLoading}
          disabled={invalid}
          className="w-40"
        >
          Save Changes
        </ButtonCreate>
      </div>
    </form>
  );
};

const EnvDestroy = ({ envId }: { envId: string }) => {
  const navigate = useNavigate();
  useQuery(fetchEnvironmentById({ id: envId }));
  useQuery(fetchDatabaseBackupsByEnvironment({ id: envId }));
  useQuery(fetchLogDrains({ id: envId }));
  useQuery(fetchMetricDrains({ id: envId }));

  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId }),
  );
  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId }),
  );
  const backups = useSelector((s: AppState) =>
    selectBackupsByEnvId(s, { envId }),
  );

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
      <div className="mb-4">
        <h1 className="text-lg text-red-500 font-semibold">
          <IconAlertTriangle
            className="inline pr-3 mb-1"
            style={{ width: 32 }}
            color="#AD1A1A"
          />
          Deprovision Environment
        </h1>
      </div>

      <form onSubmit={onSubmit}>
        <div>
          This will permanently deprovision <strong>{env.handle}</strong>{" "}
          environment. This action cannot be undone. If you want to proceed,
          type the <strong>{env.handle}</strong> below to continue.
        </div>

        {canDeprovision ? null : (
          <Banner className="mt-4" variant="error">
            You must first deprovision any existing{" "}
            <strong>{errs.join(", ")}</strong> inside your{" "}
            <strong>{env.handle}</strong> environment to proceed.
          </Banner>
        )}

        <div className="flex items-center gap-2 mt-4">
          <label htmlFor="delete-confirm">Confirm Name</label>
          <Input
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

  return (
    <div className="flex flex-col gap-4">
      <Box>
        <h1 className="text-lg text-gray-500 mb-4">Environment Settings</h1>
        <EnvChangeName envId={id} />
      </Box>

      <EnvDestroy envId={id} />
    </div>
  );
};
