import { FormEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  deprovisionDatabase,
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
  Button,
  ButtonLinkExternal,
  ExternalLink,
  FormGroup,
  IconAlertTriangle,
  IconExternalLink,
  IconRefresh,
  IconTrash,
  Input,
  Label,
} from "../shared";

const DeprovisionDatabase = ({ database }: DbProps) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deprovisionDatabase({ dbId: database.id });
  const loader = useLoader(action);
  const onClick = () => {
    dispatch(action);
    navigate(databaseActivityUrl(database.id));
  };
  const disabledDeprovisioning = database.handle !== deleteConfirm;

  return (
    <>
      <h1 className="text-lg text-red-500 font-semibold">
        <IconAlertTriangle
          className="inline pr-3 mb-1"
          style={{ width: 32 }}
          color="#AD1A1A"
        />
        Deprovision Database
      </h1>
      <div className="mt-2">
        <p>
          This will permanently deprovision <strong>{database.handle}</strong>{" "}
          database. This action cannot be undone. If you want to proceed, type
          the <strong>{database.handle}</strong> below to continue.
        </p>
        <div className="flex mt-4 wd-60">
          <Input
            className="flex"
            name="delete-confirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <Button
            variant="secondary"
            style={{
              backgroundColor: "#AD1A1A",
              color: "#FFF",
            }}
            disabled={disabledDeprovisioning}
            isLoading={loader.isLoading}
            className="h-15 w-70 mb-0 ml-4 flex"
            onClick={onClick}
          >
            <IconTrash color="#FFF" className="mr-2" />
            Deprovision Database
          </Button>
        </div>
      </div>
    </>
  );
};

interface DbProps {
  database: DeployDatabase;
}

const ChangeName = ({ database }: DbProps) => {
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
      <FormGroup label={""} htmlFor="input-name">
        <Label className="text-base font-semibold text-gray-900 block">
          Database Name
        </Label>
        <Input
          name="app-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
          autoComplete="name"
          data-testid="input-name"
          id="input-name"
        />
      </FormGroup>
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
              <li>{drain.handle}</li>
            ))}
          </ul>
        </Banner>
      ) : null}

      <div className="flex mt-4">
        <Button
          className="w-40 flex semibold"
          type="submit"
          isLoading={loader.isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

const RestartDatabase = ({ database }: DbProps) => {
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
      <Label className="mt-4">Restart Database</Label>
      <Button
        variant="white"
        isLoading={loader.isLoading}
        className="h-15 w-30 mb-0 ml-0 mt-1 flex"
        onClick={onClick}
      >
        <IconRefresh className="mr-2" variant="sm" />
        Restart
      </Button>
    </>
  );
};

export const DatabaseSettingsPage = () => {
  const { id = "" } = useParams();
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));

  return (
    <div className="mb-4">
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
        <h1 className="text-lg text-gray-500">Database Settings</h1>
        <br />

        <ChangeName database={database} />
        <hr className="mt-6" />
        <RestartDatabase database={database} />
      </Box>

      <Box className="mt-4 mb-8">
        <DeprovisionDatabase database={database} />
      </Box>
    </div>
  );
};
