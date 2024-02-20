import { selectAppConfigById, selectEnvironmentById } from "@app/deploy";
import { useSelector } from "@app/react";
import { DeployApp } from "@app/types";
import { useState } from "react";
import { Code } from "./code";
import { ExternalLink } from "./external-link";
import { Group } from "./group";
import { PreCode, PreText, listToInvertedTextColor } from "./pre-code";
import { Radio, RadioGroup } from "./select";
import { tokens } from "./tokens";

type DeployTypeGha = "main" | "master" | "release" | "manual";

const deployTypeToGha = (type: DeployTypeGha) => {
  if (type === "release") {
    return `on:
  release:
    types: [published]
  workflow_dispatch: {}`;
  }

  if (type === "manual") {
    return `on:
  workflow_dispatch: {}`;
  }

  if (type === "master") {
    return `on:
  push:
    branches: [master]
  workflow_dispatch: {}`;
  }

  return `on:
  push:
    branches: [main]
  workflow_dispatch: {}`;
};

interface TemplateProps {
  aptibleType: "git" | "docker";
  type: DeployTypeGha;
  appHandle: string;
  envHandle: string;
}

const ghaTemplate = ({
  aptibleType,
  type,
  appHandle,
  envHandle,
}: TemplateProps) => `name: aptible

${deployTypeToGha(type)}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: Deploy to Aptible
      uses: aptible/aptible-deploy-action@v4
      with:
        type: ${aptibleType}
        app: ${appHandle}
        environment: ${envHandle}
        username: \${{ secrets.APTIBLE_USERNAME }}
        password: \${{ secrets.APTIBLE_PASSWORD }}`;

export const AppAutoDeployGuide = ({ app }: { app: DeployApp }) => {
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
  const config = useSelector((s) =>
    selectAppConfigById(s, { id: app.currentConfigurationId }),
  );
  const dockerImage = config.env.APTIBLE_DOCKER_IMAGE;
  const aptibleType = dockerImage ? "docker" : "git";
  const [deployType, setDeployType] = useState<DeployTypeGha>("main");

  return (
    <Group>
      <div>
        <h4 className={tokens.type.h4}>
          1. Create directory in your code repo if it doesn't exist already
        </h4>
        <PreCode
          segments={listToInvertedTextColor(["mkdir -p", ".github/workflows"])}
          allowCopy
        />
      </div>

      <div>
        <h4 className={tokens.type.h4}>
          When do you want to trigger a deployment?
        </h4>
        <RadioGroup
          name="deployment-type"
          selected={deployType}
          onSelect={(s) => {
            setDeployType(s);
          }}
        >
          <Radio value="main">Push to main</Radio>
          <Radio value="master">Push to master</Radio>
          <Radio value="release">GitHub release</Radio>
          <Radio value="manual">Manually Trigger</Radio>
        </RadioGroup>
      </div>

      <div>
        <h4 className={tokens.type.h4}>
          2. Copy and Paste into <Code>.github/workflows/aptible.yml</Code>
        </h4>
        <PreText
          text={ghaTemplate({
            aptibleType,
            envHandle: env.handle,
            appHandle: app.handle,
            type: deployType,
          })}
          allowCopy
        />
      </div>

      <div>
        <h4 className={tokens.type.h4}>3. Add secrets to GitHub repository</h4>
        <p>
          We require your Aptible username and password to deploy your App. To
          add GitHub secrets to your repo or organization,{" "}
          <ExternalLink href="https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions">
            read this guide on GitHub
          </ExternalLink>
          . Further, we recommend creating a robot user, adding it to your
          Organization, restricting its permissions, and adding that username
          and password to GitHub.{" "}
          <ExternalLink href="https://www.aptible.com/docs/ci-deploy-user">
            Learn more
          </ExternalLink>
        </p>
      </div>

      <div>
        <h4 className={tokens.type.h4}>
          4. Commit your changes and push to GitHub
        </h4>
      </div>
    </Group>
  );
};
