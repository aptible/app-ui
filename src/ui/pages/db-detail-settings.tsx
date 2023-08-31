import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  deprovisionDatabase,
  fetchDatabase,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  restartDatabase,
  selectDatabaseById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  updateDatabase,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { databaseActivityUrl, operationDetailUrl } from "@app/routes";
import {
  AppState,
  DeployDatabase,
  DeployLogDrain,
  DeployMetricDrain,
} from "@app/types";

import {
  Banner,
  Box,
  BoxGroup,
  Button,
  ButtonCreate,
  ButtonDestroy,
  ButtonLinkExternal,
  ButtonOps,
  ExternalLink,
  FormGroup,
  Group,
  IconAlertTriangle,
  IconExternalLink,
  IconRefresh,
  IconTrash,
  Input,
  Label,
} from "../shared";

const DatabaseDeprovision = ({ database }: DbProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deprovisionDatabase({ dbId: database.id });
  const loader = useLoader(action);
  const onSubmit = () => {
    dispatch(action);
    navigate(databaseActivityUrl(database.id));
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

interface DbProps {
  database: DeployDatabase;
}

const DatabaseNameChange = ({ database }: DbProps) => {
  const dispatch = useDispatch();
  const [handle, setHandle] = useState<string>("");
  useEffect(() => {
    setHandle(database.handle);
  }, [database.id]);
  const action = updateDatabase({ id: database.id, handle });
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

  return (
    <form onSubmit={onSubmit}>
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
          <Banner variant="info" showIcon={false} className="mt-4">
            <p>
              You must <b>reload the database</b> for the new name to appear in
              the following log and metric drains, view the docs (
              <ExternalLink
                variant="default"
                href="https://www.aptible.com/docs/log-drains"
              >
                log drains
              </ExternalLink>
              ,{" "}
              <ExternalLink
                variant="default"
                href="https://www.aptible.com/docs/metric-drains"
              >
                metric drains
              </ExternalLink>
              ) to learn more:
            </p>
            <ul className="list-disc ml-4 mt-2">
              {drains.map((drain) => (
                <li key={drain.id}>{drain.handle}</li>
              ))}
            </ul>
          </Banner>
        ) : null}
      </FormGroup>

      <Group variant="horizontal" size="sm" className="mt-4">
        <ButtonCreate
          envId={database.environmentId}
          className="w-40 semibold"
          type="submit"
          isLoading={loader.isLoading}
          disabled={handle === database.handle}
        >
          Save Changes
        </ButtonCreate>

        <Button variant="white" onClick={() => setHandle(database.handle)}>
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
    navigate(operationDetailUrl(loader.meta.opId));
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
        <ButtonLinkExternal
          href="https://www.aptible.com/docs/managing-databases"
          className="relative float-right"
          variant="white"
          size="sm"
        >
          View Docs
          <IconExternalLink className="inline ml-1 h-5 mt-0" />
        </ButtonLinkExternal>

        <h1 className="text-lg text-gray-500 mb-4">Database Settings</h1>
        <DatabaseNameChange database={database} />
        <hr className="mt-6" />
        <DatabaseRestart database={database} />
      </Box>

      <Box>
        <DatabaseDeprovision database={database} />
      </Box>
    </BoxGroup>
  );
};
