import {
  cancelAppOpsPoll,
  fetchApp,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
} from "@app/deploy";
import { selectLatestDeployOp } from "@app/deploy";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { appDeployConfigureUrl, appDeployGetStartedUrl } from "@app/routes";
import { DeployApp } from "@app/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppSidebarLayout } from "../layouts";
import {
  Box,
  ButtonLink,
  Code,
  ExternalLink,
  Group,
  PreCode,
  PreText,
  ProgressProject,
  Radio,
  RadioGroup,
  listToInvertedTextColor,
  tokens,
} from "../shared";

const usePollAppOperations = (appId: string) => {
  const dispatch = useDispatch();
  const appOps = useQuery(pollAppOperations({ id: appId }));
  useEffect(() => {
    const cancel = () => dispatch(cancelAppOpsPoll());
    cancel();
    dispatch(pollAppOperations({ id: appId }));
    return () => {
      cancel();
    };
  }, [appId]);

  return appOps;
};

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

const ghaTemplate = ({
  type,
  appHandle,
  envHandle,
}: { type: DeployTypeGha; appHandle: string; envHandle: string }) => `name: aptible

${deployTypeToGha(type)}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: Deploy to Aptible
      uses: aptible/aptible-deploy-action@v2
      with:
        type: git
        app: ${appHandle}
        environment: ${envHandle}
        username: \${{ secrets.APTIBLE_USERNAME }}
        password: \${{ secrets.APTIBLE_PASSWORD }}`;

const AppAutoDeployGuide = ({ app }: { app: DeployApp }) => {
  const env = useSelector((s) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );
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
        <h4 className={tokens.type.h4}>4. Commit your changes</h4>
      </div>
    </Group>
  );
};

export const AppDeployWithGithubPage = () => {
  const navigate = useNavigate();
  const { appId = "" } = useParams();
  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));
  usePollAppOperations(appId);
  const deployOp = useSelector((s) => selectLatestDeployOp(s, { appId }));

  useEffect(() => {
    if (deployOp && deployOp.status === "succeeded") {
      navigate(appDeployConfigureUrl(appId));
    }
  }, [deployOp]);

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Add our GitHub Action to your Repo</h1>
        <p className="my-4 text-gray-600">
          Add a GitHub Workflow to your repo to deploy an App on Aptible.
        </p>
      </div>

      <ProgressProject
        cur={2}
        prev={appDeployGetStartedUrl(appId)}
        next={appDeployConfigureUrl(appId)}
      />

      <Box className="w-full max-w-[700px] mx-auto">
        <AppAutoDeployGuide app={app} />

        <div>
          <h4 className={tokens.type.h4}>5. Configure your App</h4>
          <ButtonLink to={appDeployConfigureUrl(app.id)}>Configure</ButtonLink>
        </div>
      </Box>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
