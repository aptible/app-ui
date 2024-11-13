import {
  deprovisionDatabase,
  fetchDatabase,
  fetchDatabaseDependents,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  getContainerProfileFromType,
  restartDatabase,
  restartRecreateDatabase,
  selectContainerProfilesForStack,
  selectDatabaseById,
  selectDatabaseDependents,
  selectEnvironmentById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  selectServiceById,
  unlinkDatabase,
  updateDatabase,
} from "@app/deploy";
import { selectOrganizationSelectedId } from "@app/organizations";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import {
  databaseActivityUrl,
  databaseDetailUrl,
  environmentActivityUrl,
} from "@app/routes";
import { DEFAULT_INSTANCE_CLASS } from "@app/schema";
import type {
  DeployDatabase,
  DeployLogDrain,
  DeployMetricDrain,
  InstanceClass,
} from "@app/types";
import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Link } from "react-router-dom";
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
  EnvPerms,
  ExternalLink,
  FormGroup,
  Group,
  IconAlertTriangle,
  IconRefresh,
  IconTrash,
  Input,
  Label,
  Select,
  type SelectOption,
} from "../shared";

interface DbProps {
  database: DeployDatabase;
}

const DatabaseDeprovision = ({ database }: DbProps) => {
  const environment = useSelector((s) =>
    selectEnvironmentById(s, { id: database.environmentId }),
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useQuery(fetchDatabaseDependents({ id: database.id }));
  const dependents = useSelector((s) =>
    selectDatabaseDependents(s, { id: database.id }),
  );
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deprovisionDatabase({ dbId: database.id });
  const loader = useLoader(action);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
    navigate(environmentActivityUrl(environment.id));
  };
  const isDisabled = database.handle !== deleteConfirm || dependents.length > 0;

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Deprovision Database
      </h1>

      <Group>
        {dependents.length > 0 ? (
          <Banner>
            <p>
              These other databases depend on <strong>{database.handle}</strong>
              , you must delete them first:
            </p>

            <ul className="list-disc list-inside">
              {dependents.map((dep) => (
                <li key={dep.id}>
                  <Link to={databaseDetailUrl(dep.id)}>{dep.handle}</Link>
                </li>
              ))}
            </ul>
          </Banner>
        ) : null}
        <p>
          This will permanently deprovision <strong>{database.handle}</strong>{" "}
          database. This action cannot be undone. If you want to proceed, type{" "}
          <strong>{database.handle}</strong> below to continue.
        </p>

        <BannerMessages {...loader} />

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
  const environment = useSelector((s) =>
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

  const service = useSelector((s) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const containerProfilesForStack = useSelector((s) =>
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
  const logDrains = useSelector((s) =>
    selectLogDrainsByEnvId(s, { envId: database.environmentId }),
  );
  const metricDrains = useSelector((s) =>
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
      label: "Disabled: No future automatic backups",
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

      <FormGroup
        label="Database Backups"
        description={
          <p>
            When disabled, there will be no new automatic backups taken of this
            database. This does not automatically delete any existing taken
            backups.{" "}
            <a
              href="https://www.aptible.com/docs/core-concepts/managed-databases/managing-databases/database-backups#excluding-a-database-from-new-automatic-backups"
              target="_blank"
              rel="noreferrer"
            >
              View docs for how to delete backups.
            </a>
          </p>
        }
        htmlFor="input-backup"
      >
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

const DatabaseUnlinkFromSource = ({ database }: DbProps) => {
  const dispatch = useDispatch();
  const [unlinkConfirm, setUnlinkConfirm] = useState<string>("");
  const action = unlinkDatabase({ id: database.id });
  const loader = useLoader(action);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };
  const isDisabled = database.handle !== unlinkConfirm;

  return (
    <div>
      {database.initializeFrom && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-4">
          <FormGroup
            label="Unlink Replica from Source"
            description={
              <p>
                <strong>This action does not stop replication.</strong> You are
                about to unlink a replica from its primary. To proceed, type{" "}
                <strong>{database.handle}</strong> below to confirm these
                changes. This action cannot be undone or reversed.{" "}
              </p>
            }
            htmlFor="unlink replica"
          />

          <Group variant="horizontal" size="sm" className="items-center">
            <Input
              className="flex-1"
              name="unlink-confirm"
              type="text"
              value={unlinkConfirm}
              onChange={(e) => setUnlinkConfirm(e.currentTarget.value)}
              id="unlink-confirm"
            />
            <ButtonDestroy
              envId={database.environmentId}
              variant="delete"
              disabled={isDisabled}
              isLoading={loader.isLoading}
              className="w-70"
              type="submit"
            >
              {/* <IconTrash color="#FFF" className="mr-2" /> */}
              Unlink Replica from Source
            </ButtonDestroy>
          </Group>
        </form>
      )}
      <BannerMessages {...loader} />
      {(database.initializeFrom || loader.isSuccess) && <hr className="mt-6" />}
    </div>
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
  const database = useSelector((s) => selectDatabaseById(s, { id }));
  const orgId = useSelector(selectOrganizationSelectedId);

  return (
    <BoxGroup>
      <Box>
        <div className="flex justify-between items-start">
          <h1 className="text-lg text-gray-500 mb-4">Database Settings</h1>
          <ButtonLinkDocs href="https://www.aptible.com/docs/managing-databases" />
        </div>
        <DatabaseNameChange database={database} />
        <hr className="mt-6" />
        <DatabaseUnlinkFromSource database={database} />
        <DatabaseRestart database={database} />
      </Box>

      <EnvPerms envId={database.environmentId} orgId={orgId} />

      <Box>
        <DatabaseRestartRecreate database={database} />
      </Box>

      <Box>
        <DatabaseDeprovision database={database} />
      </Box>
    </BoxGroup>
  );
};
