import { configEnvListToEnv, createAppOperation } from "@app/deploy";
import { useDispatch, useLoader, useLoaderSuccess } from "@app/react";
import { appActivityUrl } from "@app/routes";
import type { DeployApp, DeployAppConfigEnv } from "@app/types";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useEnvEditor } from "../hooks";
import { Banner } from "./banner";
import { Button, ButtonSensitive } from "./button";
import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { FormGroup } from "./form-group";
import { Group } from "./group";
import { IconEdit } from "./icons";
import { PreText } from "./pre-code";
import { tokens } from "./tokens";

export const EnvEditor = ({ app }: { app: DeployApp }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { envs, envList, setEnvs, errors, validate } = useEnvEditor("");
  const previewEnv = configEnvListToEnv(envList);

  const action = createAppOperation({
    appId: app.id,
    type: "configure",
    env: previewEnv,
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

  return (
    <form onSubmit={onSubmit}>
      <Group>
        <EnvEditorFormInput
          envs={envs}
          setEnvs={setEnvs}
          errors={errors}
          previewEnv={previewEnv}
        />

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

export function EnvEditorFormInput({
  envs,
  setEnvs,
  errors,
  previewEnv,
}: {
  previewEnv: DeployAppConfigEnv;
  setEnvs: (e: string) => void;
  envs: string;
  errors: { message: string }[];
}) {
  const desc = (
    <div>
      <p>
        Specify any ENV variables you wish to add or modify, one per line. We
        use{" "}
        <ExternalLink variant="info" href="https://github.com/motdotla/dotenv">
          dotenv
        </ExternalLink>{" "}
        to parse these variables.
      </p>
      <ol className="list-disc list-inside">
        <li>
          Each line corresponds to a separate variable with the format{" "}
          <Code>ENV_VAR="value"</Code> or <Code>ENV_VAR='value'</Code>.
        </li>
        <li>
          If you want to delete an environment variable, set it to an empty
          string, with or without double quotes: <Code>ENV_VAR=""</Code>.
        </li>
        <li>
          Multi-line environment variables may be set by wrapping in double
          quotes.
        </li>
      </ol>
    </div>
  );

  return (
    <Group>
      <Banner variant="warning">
        Warning: This UI uses dotenv to parse ENV variables. Dotenv parsing
        differs slightly from shell, so if you're most familiar with setting ENV
        variables in shell, e.g. via the <Code>aptible config:set</Code> CLI
        command, note that this parser may behave differently with multi-line
        variables or special characters. We recommend first setting variables on
        a staging app or a different ENV key within a production app if unsure
        how the variable will be parsed.
      </Banner>
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

      <div className={tokens.type.h4}>Preview</div>
      <PreText
        className="max-w-screen-md"
        allowCopy={false}
        text={JSON.stringify(previewEnv, null, 2)}
      />
    </Group>
  );
}
