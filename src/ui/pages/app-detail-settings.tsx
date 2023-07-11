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
  IconTrash,
  Input,
  PreCode,
  listToInvertedTextColor,
} from "../shared";
import {
  deprovisionApp,
  fetchApp,
  fetchLogDrains,
  fetchMetricDrains,
  selectAppById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  updateApp,
} from "@app/deploy";
import { useLoader, useQuery } from "@app/fx";
import { appActivityUrl } from "@app/routes";
import { AppState, DeployLogDrain, DeployMetricDrain } from "@app/types";
import { SyntheticEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

export const AppSettingsPage = () => {
  const [handle, setHandle] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const [isDeprovisioning, setIsDeprovisioning] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const updatingAppLoader = useLoader(updateApp);

  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: app.environmentId }),
  );
  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: app.environmentId }),
  );

  useQuery(fetchLogDrains({ id: app.environmentId }));
  useQuery(fetchMetricDrains({ id: app.environmentId }));

  const drains: (DeployLogDrain | DeployMetricDrain)[] =
    [...logDrains, ...metricDrains] || [];

  useEffect(() => {
    setHandle(app.handle);
  }, [app.id]);

  const onSubmitForm = (e: SyntheticEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    dispatch(updateApp({ id, handle }));
    setIsUpdating(false);
  };

  const requestDeprovisionApp = (e: SyntheticEvent) => {
    e.preventDefault();

    setIsUpdating(true);
    setIsDeprovisioning(true);
    dispatch(deprovisionApp({ appId: app.id }));
    navigate(appActivityUrl(id));
  };

  const disabledDeprovisioning =
    isDeprovisioning || app.handle !== deleteConfirm;

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

          <hr />

          <div className="flex mt-4">
            <Button
              className="w-40 mb-4 flex semibold"
              type="submit"
              disabled={isUpdating || updatingAppLoader.isLoading}
            >
              {isUpdating || updatingAppLoader.isLoading
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
              className="h-15 w-60 mb-0 ml-4 flex"
              onClick={requestDeprovisionApp}
            >
              <IconTrash color="#FFF" className="mr-2" />
              {isDeprovisioning ? "Deprovisioning..." : "Deprovision App"}
            </Button>
          </div>
        </div>
      </Box>
    </BoxGroup>
  );
};
