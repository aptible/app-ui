import {
  DeployCodeScanResponse,
  configEnvListToEnv,
  createAppOperation,
  fetchApp,
  fetchConfiguration,
  hasDeployOperation,
  selectAppById,
} from "@app/deploy";
import {
  useDispatch,
  useLoader,
  useLoaderSuccess,
  useQuery,
  useSelector,
} from "@app/react";
import { appActivityUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import { DeployApp } from "@app/types";
import { useState } from "react";
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
  ExternalLink,
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
  const { envs, envList, setEnvs, errors, validate } = useEnvEditor("");
  const partialEnv = configEnvListToEnv(envList);

  const action = createAppOperation({
    appId: app.id,
    type: "configure",
    env: partialEnv,
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
    setEnvs("");
  };

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

  const desc = (
    <p>
      Add any additional required variables, such as API keys, KNOWN_HOSTS
      setting, etc. We use{" "}
      <ExternalLink variant="info" href="https://github.com/motdotla/dotenv">
        dotenv
      </ExternalLink>{" "}
      to parse the textarea. Each line is a separate variable in format:{" "}
      <Code>ENV_VAR="VALUE"</Code>. If you want to delete an environment
      variable, set it to empty: <Code>ENV_VAR=""</Code>. If you have an
      environment variable that spans multiple lines then wrap in double quotes.
    </p>
  );

  return (
    <form onSubmit={onSubmit}>
      <Group>
        <FormGroup
          label="Environment Variables"
          htmlFor="envs"
          feedbackVariant={errors.length > 0 ? "danger" : "info"}
          feedbackMessage={errors.map((e) => e.message).join(". ")}
          description={desc}
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
  const app = useSelector((s) => selectAppById(s, { id }));
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
