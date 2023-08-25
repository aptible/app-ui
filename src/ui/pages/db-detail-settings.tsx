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
import { AppState, DeployLogDrain, DeployMetricDrain } from "@app/types";
import { MouseEventHandler, SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

export const DatabaseSettingsPage = () => {
  const { id = "" } = useParams();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const [handle, setHandle] = useState<string>("");
  const [isDeprovisioning, setIsDeprovisioning] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const database = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: database.environmentId }),
  );
  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: database.environmentId }),
  );
  const updatingDatabaseLoader = useLoader(updateDatabase);

  useQuery(fetchEnvLogDrains({ id: database.environmentId }));
  useQuery(fetchEnvMetricDrains({ id: database.environmentId }));

  const drains: (DeployLogDrain | DeployMetricDrain)[] =
    [...logDrains, ...metricDrains] || [];

  useEffect(() => {
    setHandle(database.handle);
  }, [database.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    dispatch(updateDatabase({ id, handle }));
    setIsUpdating(false);
  };

  const requestDeprovisionDatabase: MouseEventHandler<HTMLButtonElement> =
    () => {
      setIsUpdating(true);
      setIsDeprovisioning(true);
      dispatch(deprovisionDatabase({ dbId: database.id }));
      navigate(databaseActivityUrl(id));
    };

  const restartAction = restartDatabase({ id });
  const restartLoader = useLoader(restartAction);
  const submitRestart: MouseEventHandler<HTMLButtonElement> = () => {
    dispatch(restartAction);
  };
  useLoaderSuccess(restartLoader, () => {
    navigate(operationDetailUrl(restartLoader.meta.opId));
  });

  const disabledDeprovisioning =
    isDeprovisioning || database.handle !== deleteConfirm;

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
        <form onSubmit={onSubmitForm}>
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
                You must <b>reload the database</b> for the new name to appear
                in the following log and metric drains, view the docs (
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

          <Label className="mt-4">Restart Database</Label>
          <Button
            variant="white"
            disabled={restartLoader.isLoading}
            className="h-15 w-30 mb-0 ml-0 mt-1 flex"
            onClick={submitRestart}
          >
            <IconRefresh className="mr-2" variant="sm" />
            {isDeprovisioning ? "Restarting..." : "Restart"}
          </Button>

          <hr className="mt-6" />

          <div className="flex mt-4">
            <Button
              className="w-40 flex semibold"
              type="submit"
              disabled={isUpdating || updatingDatabaseLoader.isLoading}
            >
              {isUpdating || updatingDatabaseLoader.isLoading
                ? "Loading..."
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </Box>

      <Box className="mt-4 mb-8">
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
              disabled={isDeprovisioning}
              name="delete-confirm"
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
              data-testid="delete-confirm"
              id="delete-confirm"
            />
            <Button
              variant="secondary"
              style={{
                backgroundColor: "#AD1A1A",
                color: "#FFF",
              }}
              disabled={disabledDeprovisioning}
              className="h-15 w-70 mb-0 ml-4 flex"
              onClick={requestDeprovisionDatabase}
            >
              <IconTrash color="#FFF" className="mr-2" />
              {isDeprovisioning ? "Deprovisioning..." : "Deprovision Database"}
            </Button>
          </div>
        </div>
      </Box>
    </div>
  );
};
