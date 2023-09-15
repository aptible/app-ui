import {
  DeployCodeScanResponse,
  configEnvToStr,
  createAppOperation,
  fetchApp,
  fetchConfiguration,
  hasDeployOperation,
  prepareConfigEnv,
  selectAppById,
  selectAppConfigById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { appActivityUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { AppState, DeployApp } from "@app/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { useEnvEditor, useLatestCodeResults } from "../hooks";
import {
  AppConfigView,
  BannerMessages,
  Box,
  Button,
  ButtonLinkDocs,
  ButtonSensitive,
  Code,
  FormGroup,
  Group,
  IconEdit,
  Loading,
  PreText,
  tokens,
} from "../shared";

const EnvEditor = ({ app }: { app: DeployApp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const config = useSelector((s: AppState) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const envStr = configEnvToStr(config.env);
  const { envs, envList, setEnvs, errors, validate } = useEnvEditor(envStr);
  const finalEnv = prepareConfigEnv(config.env, envList);

  const action = createAppOperation({
    appId: app.id,
    type: "configure",
    env: finalEnv,
  });
  const loader = useLoader(action);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    dispatch(action);
  };

  useLoaderSuccess(loader, () => {
    navigate(appActivityUrl(app.id));
  });

  const onReset = () => {
    setEditing(false);
    setEnvs(envStr);
  };

  useEffect(() => {
    setEnvs(envStr);
  }, [envStr]);

  if (!editing) {
    return (
      <div>
        <ButtonSensitive
          envId={app.environmentId}
          variant="white"
          onClick={() => setEditing(true)}
        >
          <IconEdit variant="sm" className="mr-2" />
          Edit
        </ButtonSensitive>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <Group>
        <FormGroup
          label="Environment Variables"
          htmlFor="envs"
          feedbackVariant={errors.length > 0 ? "danger" : "info"}
          feedbackMessage={errors.map((e) => e.message).join(". ")}
          description="Add any additional required variables, such as API keys, KNOWN_HOSTS setting, etc. Each line is a separate variable in format: ENV_VAR=VALUE. Multiline values are supported but must be wrapped in double-quotes."
        >
          <textarea
            id="envs"
            name="envs"
            className={tokens.type.textarea}
            value={envs}
            onChange={(e) => setEnvs(e.currentTarget.value)}
          />
        </FormGroup>

        <hr />

        <Group variant="horizontal">
          <ButtonSensitive
            envId={app.environmentId}
            type="submit"
            isLoading={loader.isLoading}
          >
            Save Changes
          </ButtonSensitive>
          <Button onClick={onReset} variant="white">
            Cancel
          </Button>
        </Group>
      </Group>
    </form>
  );
};

const CodeScanInfo = ({ appId }: { appId: string }) => {
  const { codeScan, scanOp } = useLatestCodeResults(appId);
  if (!hasDeployOperation(scanOp)) {
    return (
      <div>
        Code scan information is only available for <Code>git push</Code>{" "}
        deployments.
      </div>
    );
  }

  if (codeScan.isInitialLoading) {
    return <Loading />;
  }

  if (codeScan.isError) {
    return <BannerMessages {...codeScan} />;
  }

  if (!codeScan.data) {
    return <div>No data found</div>;
  }

  return (
    <Box>
      <Group size="sm">
        <h3 className={tokens.type.h3}>Code Scan</h3>
        <CodeScanView codeScan={codeScan.data} />
      </Group>
    </Box>
  );
};

const CodeScanView = ({ codeScan }: { codeScan: DeployCodeScanResponse }) => {
  return (
    <Group>
      <div>
        <div className={tokens.type.h4}>Languages Detected</div>
        <div>{capitalize(codeScan.languages_detected?.join(", ") || "")}</div>
      </div>

      <div>
        <div className={tokens.type.h4}>Procfile</div>
        <div>
          {codeScan.procfile_present ? (
            <PreText text={codeScan.procfile_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>

      <div>
        <div className={tokens.type.h4}>
          <Code>.aptible.yml</Code>
        </div>
        <div>
          {codeScan.aptible_yml_present ? (
            <PreText text={codeScan.aptible_yml_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>

      <div>
        <div className={tokens.type.h4}>Dockerfile</div>
        <div className="relative">
          {codeScan.dockerfile_present ? (
            <PreText text={codeScan.dockerfile_data || ""} />
          ) : (
            "No"
          )}
        </div>
      </div>
    </Group>
  );
};

export const AppDetailConfigPage = () => {
  const { id = "" } = useParams();
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  useQuery(fetchApp({ id }));
  useQuery(fetchConfiguration({ id: app.currentConfigurationId }));

  return (
    <Group>
      <Box>
        <Group size="sm">
          <h3 className={tokens.type.h3}>Current Environment Variables</h3>
          <AppConfigView
            configId={app.currentConfigurationId}
            envId={app.environmentId}
          />
        </Group>
      </Box>

      <Box>
        <Group size="sm">
          <div className="flex items-center justify-between">
            <h3 className={tokens.type.h3}>Edit Environment Variables</h3>
            <ButtonLinkDocs href="https://www.aptible.com/docs/configuration" />
          </div>
          <EnvEditor app={app} />
        </Group>
      </Box>

      <CodeScanInfo appId={app.id} />
    </Group>
  );
};
