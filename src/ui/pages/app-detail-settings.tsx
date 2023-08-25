import {
  Banner,
  Box,
  BoxGroup,
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
  PreCode,
  listToInvertedTextColor,
} from "../shared";
import {
  deprovisionApp,
  fetchApp,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  restartApp,
  selectAppById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  updateApp,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { appActivityUrl, operationDetailUrl } from "@app/routes";
import { AppState, DeployLogDrain, DeployMetricDrain } from "@app/types";
import { MouseEventHandler, SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

export const AppSettingsPage = () => {
  const [handle, setHandle] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const updatingAppLoader = useLoader(updateApp);
  const deprovisioningAppLoader = useLoader(deprovisionApp);

  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: app.environmentId }),
  );
  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: app.environmentId }),
  );

  useQuery(fetchEnvLogDrains({ id: app.environmentId }));
  useQuery(fetchEnvMetricDrains({ id: app.environmentId }));

  const drains: (DeployLogDrain | DeployMetricDrain)[] =
    [...logDrains, ...metricDrains] || [];

  useEffect(() => {
    setHandle(app.handle);
  }, [app.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();

    dispatch(updateApp({ id, handle }));
  };

  const requestDeprovisionApp: MouseEventHandler<HTMLButtonElement> = () => {
    dispatch(deprovisionApp({ appId: app.id }));
    navigate(appActivityUrl(id));
  };

  const restartAction = restartApp({ id });
  const restartLoader = useLoader(restartAction);
  const submitRestart: MouseEventHandler<HTMLButtonElement> = () => {
    dispatch(restartAction);
  };
  useLoaderSuccess(restartLoader, () => {
    navigate(operationDetailUrl(restartLoader.meta.opId));
  });

  const disabledDeprovisioning =
    app.handle !== deleteConfirm || deprovisioningAppLoader.isLoading;

  return (
    <BoxGroup>
      <Box>
        <ButtonLinkExternal
          href="https://www.aptible.com/docs/managing-apps"
          className="relative float-right"
          variant="white"
          size="sm"
        >
          View Docs
          <IconExternalLink className="inline ml-1 h-5 mt-0" />
        </ButtonLinkExternal>
        <h1 className="text-lg text-gray-500">How To Deploy Changes</h1>
        <div className="mt-4">
          <h3 className="text-base font-semibold">Clone project code</h3>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["git", "clone", app.gitRepo])}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-base font-semibold">Find project code</h3>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["cd", app.handle])}
          />
        </div>
        <div className="mt-4">
          <h3 className="text-base font-semibold">Deploy code changes</h3>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["git", "push", app.gitRepo])}
          />
        </div>
      </Box>
      <Box>
        <h1 className="text-lg text-gray-500">App Settings</h1>
        <br />
        <form onSubmit={onSubmitForm}>
          <FormGroup label="App Name" htmlFor="input-name">
            <Input
              name="app-handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.currentTarget.value)}
              autoComplete="name"
              data-testid="input-name"
              id="input-name"
            />
            {handle !== app.handle && drains.length ? (
              <Banner variant="info" showIcon={false} className="mt-4">
                <p>
                  You must <b>restart the app</b> for the new name to appear in
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
          </FormGroup>

          <Label className="mt-4">Restart App</Label>
          <Button
            variant="white"
            disabled={restartLoader.isLoading}
            className="h-15 w-30 mb-0 ml-0 mt-1 flex"
            onClick={submitRestart}
          >
            <IconRefresh className="mr-2" variant="sm" />
            {deprovisioningAppLoader.isLoading || restartLoader.isLoading
              ? "Restarting..."
              : "Restart"}
          </Button>

          <hr className="mt-6" />

          <div className="flex mt-4">
            <Button
              className="w-40 flex semibold"
              type="submit"
              disabled={updatingAppLoader.isLoading || restartLoader.isLoading}
            >
              {updatingAppLoader.isLoading || restartLoader.isLoading
                ? "Loading..."
                : "Save Changes"}
            </Button>
          </div>
        </form>
      </Box>
      <Box className="mb-8">
        <h1 className="text-lg text-red-500 font-semibold">
          <IconAlertTriangle
            className="inline pr-3 mb-1"
            style={{ width: 32 }}
            color="#AD1A1A"
          />
          Deprovision App
        </h1>
        <div className="mt-2">
          <p>
            This will permanently deprovision <strong>{app.handle}</strong> app.
            This action cannot be undone. If you want to proceed, type the{" "}
            <strong>{app.handle}</strong> below to continue.
          </p>
          <div className="flex mt-4 wd-60">
            <Input
              className="flex"
              disabled={deprovisioningAppLoader.isLoading}
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
              className="h-15 w-60 mb-0 ml-4 flex"
              onClick={requestDeprovisionApp}
            >
              <IconTrash color="#FFF" className="mr-2" />
              {deprovisioningAppLoader.isLoading
                ? "Deprovisioning..."
                : "Deprovision App"}
            </Button>
          </div>
        </div>
      </Box>
    </BoxGroup>
  );
};
