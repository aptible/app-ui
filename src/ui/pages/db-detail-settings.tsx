import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  DEFAULT_INSTANCE_CLASS,
  deprovisionDatabase,
  fetchDatabase,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  getContainerProfileFromType,
  restartDatabase,
  restartRecreateDatabase,
  selectContainerProfilesForStack,
  selectDatabaseById,
  selectEnvironmentById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  selectServiceById,
  updateDatabase,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { databaseActivityUrl, environmentActivityUrl } from "@app/routes";
import {
  AppState,
  DeployDatabase,
  DeployLogDrain,
  DeployMetricDrain,
  InstanceClass,
} from "@app/types";

import {
  Banner,
  BannerMessages,
  Box,
  BoxGroup,
  Button,
  ButtonCreate,
  ButtonDestroy,
  ButtonLinkDocs,
  ButtonOps,
  CheckBox,
  ExternalLink,
  FormGroup,
  Group,
  IconAlertTriangle,
  IconRefresh,
  IconTrash,
  Input,
  Label,
  Select,
  SelectOption,
} from "../shared";

interface DbProps {
  database: DeployDatabase;
}

const DatabaseDeprovision = ({ database }: DbProps) => {
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deprovisionDatabase({ dbId: database.id });
  const loader = useLoader(action);
  const onSubmit = () => {
    dispatch(action);
    navigate(environmentActivityUrl(environment.id));
  };
  const isDisabled = database.handle !== deleteConfirm;

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Deprovision Database
      </h1>

      <Group>
        <p>
          This will permanently deprovision <strong>{database.handle}</strong>{" "}
          database. This action cannot be undone. If you want to proceed, type
          the <strong>{database.handle}</strong> below to continue.
        </p>

        <Group variant="horizontal" size="sm" className="items-center">
          <Input
            className="flex-1"
            name="delete-confirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <ButtonDestroy
            envId={database.environmentId}
            variant="delete"
            disabled={isDisabled}
            isLoading={loader.isLoading}
            className="w-70"
            type="submit"
          >
            <IconTrash color="#FFF" className="mr-2" />
            Deprovision Database
          </ButtonDestroy>
        </Group>
      </Group>
    </form>
  );
};

const DatabaseRestartRecreate = ({ database }: DbProps) => {
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [containerProfileType, setContainerProfileType] =
    useState<InstanceClass>(DEFAULT_INSTANCE_CLASS);
  const [confirm, setConfirm] = useState(false);
  const action = restartRecreateDatabase({
    id: database.id,
    containerProfile: containerProfileType,
  });
  const loader = useLoader(action);
  const onSubmit = () => {
    dispatch(action);
    navigate(databaseActivityUrl(database.id));
  };
  const invalid = !confirm;

  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const containerProfilesForStack = useSelector((s: AppState) =>
    selectContainerProfilesForStack(s, { id: environment.stackId }),
  );

  useEffect(() => {
    setContainerProfileType(service.instanceClass);
  }, [service.instanceClass]);

  const handleContainerProfileSelection = (opt: SelectOption) => {
    const value = opt.value as InstanceClass;
    const profile = getContainerProfileFromType(value);
    if (!profile) {
      return;
    }
    setContainerProfileType(value);
  };

  const profileOptions = Object.keys(containerProfilesForStack).map(
    (containerProfileType) => {
      const profile = getContainerProfileFromType(
        containerProfileType as InstanceClass,
      );
      return { label: profile.name, value: containerProfileType };
    },
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2">
        <IconAlertTriangle color="#AD1A1A" />
        Restart Database with Disk Backup and Restore
      </h1>

      <BannerMessages {...loader} />

      <Group>
        <p>
          This action will restart <strong>{database.handle}</strong> with a
          different container profile and allow it to move availability zones if
          necessary. During the restart, the disk will be detached and{" "}
          <strong>downtime will occur</strong>.
        </p>
        <Group>
          <FormGroup label="Container Profile" htmlFor="container-profile">
            <Select
              id="container-profile"
              className="w-1/2"
              ariaLabel="container-profile"
              disabled={Object.keys(containerProfilesForStack).length <= 1}
              value={containerProfileType}
              onSelect={handleContainerProfileSelection}
              options={profileOptions}
            />
          </FormGroup>
          <CheckBox
            label="I understand the warning above"
            checked={confirm}
            onChange={(e) => setConfirm(e.currentTarget.checked)}
          />
          <ButtonDestroy
            envId={database.environmentId}
            variant="primary"
            disabled={invalid}
            isLoading={loader.isLoading}
            type="submit"
            className="w-fit"
          >
            Restart Database with Disk Backup and Restore
          </ButtonDestroy>
        </Group>
      </Group>
    </form>
  );
};

const DatabaseNameChange = ({ database }: DbProps) => {
  const dispatch = useDispatch();
  const [enableBackups, setEnableBackups] = useState<boolean>(true);
  const [handle, setHandle] = useState<string>("");
  useEffect(() => {
    setHandle(database.handle);
    setEnableBackups(database.enableBackups);
  }, [database.id]);
  const action = updateDatabase({
    id: database.id,
    handle,
    enableBackups,
  });
  const loader = useLoader(action);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };
  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: database.environmentId }),
  );
  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: database.environmentId }),
  );

  useQuery(fetchEnvLogDrains({ id: database.environmentId }));
  useQuery(fetchEnvMetricDrains({ id: database.environmentId }));

  const drains: (DeployLogDrain | DeployMetricDrain)[] =
    [...logDrains, ...metricDrains] || [];

  const options: SelectOption[] = [
    {
      label:
        "Enabled: Allow backups according to environment " +
        "backup retention policy",
      value: "true",
    },
    {
      label: "Disabled: No automatic backups enabled",
      value: "false",
    },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FormGroup label="Database Name" htmlFor="input-name">
        <Input
          name="app-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
          autoComplete="name"
          id="input-name"
        />

        {handle !== database.handle && drains.length ? (
          <Banner variant="info" showIcon={true} className="mt-4">
            <p>
              You must <b>restart the database</b> for the new name to appear in
              the following
              <ExternalLink
                variant="default"
                href="https://www.aptible.com/docs/log-drains"
              >
                {" "}
                log drains
              </ExternalLink>{" "}
              and{" "}
              <ExternalLink
                variant="default"
                href="https://www.aptible.com/docs/metric-drains"
              >
                {" "}
                metric drains
              </ExternalLink>
              :
            </p>
            <ul className="list-disc ml-4">
              {drains.map((drain) => (
                <li key={drain.id}>{drain.handle}</li>
              ))}
            </ul>
          </Banner>
        ) : null}
      </FormGroup>

      <FormGroup label="Database Backups" htmlFor="input-backup">
        <Select
          ariaLabel="Database Backups"
          id="input-backup"
          options={options}
          onSelect={(opt) => setEnableBackups(opt.value === "true")}
          value={enableBackups.toString()}
        />
      </FormGroup>

      <BannerMessages {...loader} />

      <Group variant="horizontal" size="sm">
        <ButtonCreate
          envId={database.environmentId}
          className="w-40 semibold"
          type="submit"
          isLoading={loader.isLoading}
          disabled={
            handle === database.handle &&
            enableBackups === database.enableBackups
          }
        >
          Save Changes
        </ButtonCreate>

        <Button
          variant="white"
          onClick={() => {
            setHandle(database.handle);
            setEnableBackups(database.enableBackups);
          }}
        >
          Cancel
        </Button>
      </Group>
    </form>
  );
};

const DatabaseRestart = ({ database }: DbProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const action = restartDatabase({ id: database.id });
  const loader = useLoader(action);
  const onClick = () => {
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(database.id));
  });
  return (
    <>
      <Label className="mt-4 pb-1">Restart Database</Label>
      <ButtonOps
        envId={database.environmentId}
        variant="white"
        isLoading={loader.isLoading}
        className="flex"
        onClick={onClick}
      >
        <IconRefresh className="mr-2" variant="sm" />
        Restart
      </ButtonOps>
    </>
  );
};

export const DatabaseSettingsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  return (
    <BoxGroup>
      <Box>
        <div className="flex justify-between items-start">
          <h1 className="text-lg text-gray-500 mb-4">Database Settings</h1>
          <ButtonLinkDocs href="https://www.aptible.com/docs/managing-databases" />
        </div>
        <DatabaseNameChange database={database} />
        <hr className="mt-6" />
        <DatabaseRestart database={database} />
      </Box>

      <Box>
        <DatabaseRestartRecreate database={database} />
      </Box>

      <Box>
        <DatabaseDeprovision database={database} />
      </Box>
    </BoxGroup>
  );
};
