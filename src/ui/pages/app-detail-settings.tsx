import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  deprovisionApp,
  fetchApp,
  fetchEnvLogDrains,
  fetchEnvMetricDrains,
  restartApp,
  selectAppById,
  selectAppConfigById,
  selectEnvironmentById,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
  updateApp,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { appActivityUrl, environmentActivityUrl } from "@app/routes";
import {
  AppState,
  DeployApp,
  DeployLogDrain,
  DeployMetricDrain,
} from "@app/types";

import {
  Banner,
  BannerMessages,
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
  PreBox,
  PreCode,
  TextSegment,
  listToInvertedTextColor,
  tokens,
} from "../shared";

interface AppProps {
  app: DeployApp;
}

const AppDeprovision = ({ app }: AppProps) => {
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  const action = deprovisionApp({ appId: app.id });
  const loader = useLoader(action);
  const onClick = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    dispatch(action);
    navigate(environmentActivityUrl(environment.id));
  };
  const isDisabled = app.handle !== deleteConfirm;

  return (
    <form onSubmit={onClick}>
      <h1 className="text-lg text-red-500 font-semibold flex items-center gap-2 mb-4">
        <IconAlertTriangle color="#AD1A1A" />
        Deprovision App
      </h1>

      <Group>
        <p>
          This will permanently deprovision <strong>{app.handle}</strong> app.
          This action cannot be undone. If you want to proceed, type the{" "}
          <strong>{app.handle}</strong> below to continue.
        </p>

        <Group variant="horizontal" size="sm" className="items-center">
          <Input
            className="flex-1"
            disabled={loader.isLoading}
            name="delete-confirm"
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.currentTarget.value)}
            id="delete-confirm"
          />
          <ButtonDestroy
            envId={app.environmentId}
            type="submit"
            variant="delete"
            className="w-70 flex"
            disabled={isDisabled}
            isLoading={loader.isLoading}
          >
            <IconTrash color="#FFF" className="mr-2" />
            Deprovision App
          </ButtonDestroy>
        </Group>
      </Group>
    </form>
  );
};

const AppRestart = ({ app }: AppProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const action = restartApp({ id: app.id });
  const loader = useLoader(action);
  const onClick = () => {
    dispatch(action);
  };
  useLoaderSuccess(loader, () => {
    navigate(appActivityUrl(app.id));
  });

  return (
    <Group size="sm">
      <h4 className={tokens.type.h4}>Restart App and Services</h4>
      <div>
        <ButtonOps
          envId={app.environmentId}
          variant="white"
          onClick={onClick}
          isLoading={loader.isLoading}
        >
          <IconRefresh className="mr-2" variant="sm" />
          Restart
        </ButtonOps>
      </div>
    </Group>
  );
};

const AppNameChange = ({ app }: AppProps) => {
  const dispatch = useDispatch();
  const [handle, setHandle] = useState<string>("");
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

  const action = updateApp({ id: app.id, handle });
  const loader = useLoader(action);
  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(action);
  };

  useEffect(() => {
    setHandle(app.handle);
  }, [app.id]);

  return (
    <form onSubmit={onSubmitForm} className="flex flex-col gap-4">
      <FormGroup label="App Name" htmlFor="input-name">
        <Input
          name="app-handle"
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.currentTarget.value)}
          autoComplete="name"
          id="input-name"
        />

        {handle !== app.handle && drains.length ? (
          <Banner variant="info" showIcon={false} className="mt-4">
            <p>
              You must <b>restart the app</b> for the new name to appear in the
              following log and metric drains, view the docs (
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

      <BannerMessages {...loader} />

      <Group variant="horizontal" size="sm">
        <ButtonCreate
          envId={app.environmentId}
          className="w-40 semibold"
          type="submit"
          disabled={handle === app.handle}
          isLoading={loader.isLoading}
        >
          Save Changes
        </ButtonCreate>

        <Button variant="white" onClick={() => setHandle(app.handle)}>
          Cancel
        </Button>
      </Group>
    </form>
  );
};

const AppConfigView = ({ app }: { app: DeployApp }) => {
  const [isVisible, setVisible] = useState(false);
  const config = useSelector((s: AppState) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const envs: TextSegment[] = [];
  Object.keys(config.env).forEach((key) => {
    envs.push(
      { text: `${key}=`, className: "text-lime" },
      { text: `${config.env[key]}`, className: "text-white" },
      { text: "\n", className: "" },
    );
  });

  return (
    <Group size="sm">
      <h4 className={tokens.type.h4}>Environment Variables</h4>
      {isVisible ? (
        <Group size="sm">
          <div>
            <Button variant="white" onClick={() => setVisible(false)}>
              Hide
            </Button>
          </div>
          <PreBox allowCopy segments={envs} />
        </Group>
      ) : (
        <div>
          <Button variant="white" onClick={() => setVisible(true)}>
            Show
          </Button>
        </div>
      )}
    </Group>
  );
};

export const AppSettingsPage = () => {
  const { id = "" } = useParams();
  useQuery(fetchApp({ id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));

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
        <h3 className="text-lg text-gray-500">How To Deploy Changes</h3>
        <div className="mt-4">
          <h4 className={tokens.type.h4}>Clone project code</h4>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["git", "clone", app.gitRepo])}
          />
        </div>
        <div className="mt-4">
          <h4 className={tokens.type.h4}>Find project code</h4>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["cd", app.handle])}
          />
        </div>
        <div className="mt-4">
          <h4 className={tokens.type.h4}>Deploy code changes</h4>
          <PreCode
            allowCopy
            segments={listToInvertedTextColor(["git", "push", app.gitRepo])}
          />
        </div>
      </Box>

      <Box>
        <Group>
          <h3 className={"text-lg text-gray-500"}>App Settings</h3>
          <AppNameChange app={app} />
          <hr />
          <AppRestart app={app} />
          <hr />
          <AppConfigView app={app} />
        </Group>
      </Box>

      <Box>
        <AppDeprovision app={app} />
      </Box>
    </BoxGroup>
  );
};
