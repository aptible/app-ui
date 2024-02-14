import { fetchApp, selectAppById } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import {
  appDeployConfigureUrl,
  appDeployWithGitAddKeyUrl,
  appDeployWithGitUrl,
  createAppUrl,
} from "@app/routes";
import { DeployOperation } from "@app/types";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSshKeyRequired } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  AddSSHKeyForm,
  Banner,
  Box,
  ButtonLink,
  Code,
  ExternalLink,
  PreBox,
  PreCode,
  ProgressProject,
  Select,
  SelectOption,
  listToInvertedTextColor,
  tokens,
} from "../shared";

export const AppDeployWithGitAddKeyPage = () => {
  const { appId = "" } = useParams();
  const navigate = useNavigate();
  const url = appDeployWithGitUrl(appId);
  const onSuccess = () => navigate(url);

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Add your SSH Key</h1>
        <p className="my-4 text-gray-600">
          Add your SSH key to push code into Aptible.
        </p>
      </div>

      <ProgressProject cur={2} prev={createAppUrl()} next={url} />

      <Box className="w-full max-w-[700px] mx-auto">
        <AddSSHKeyForm onSuccess={onSuccess} />
      </Box>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};

interface StarterOption extends SelectOption {
  query: { [key: string]: string[] };
  repo: string;
}

const customCodeOption = {
  label: "Custom Code",
  value: "none",
  query: {},
  repo: "",
};
const starterTemplateOptions: StarterOption[] = [
  customCodeOption,
  {
    label: "Ruby on Rails v7 Template",
    value: "git@github.com:aptible/template-rails.git",
    repo: "template-rails",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
      envs: ["production_secret_key"],
    },
  },
  {
    label: "Django v4 Template",
    value: "git@github.com:aptible/template-django.git",
    repo: "template-django",
    query: { dbs: ["database_url:postgresql:14"], envs: ["secret_key"] },
  },
  {
    label: "Express v4 Template",
    value: "git@github.com:aptible/template-express.git",
    repo: "template-express",
    query: { dbs: ["database_url:postgresql:14"] },
  },
  {
    label: "Laravel v10 Template",
    value: "git@github.com:aptible/template-laravel.git",
    repo: "template-laravel",
    query: {
      dbs: ["database_url:postgresql:14"],
      envs: ["db_connection:aptible", "app_key"],
    },
  },
  {
    label: "Deploy Demo App Template",
    value: "git@github.com:aptible/deploy-demo-app.git",
    repo: "deploy-demo-app",
    query: {
      dbs: ["database_url:postgresql:14", "redis_url:redis:3.0"],
    },
  },
];

export const AppDeployWithGitPage = () => {
  const { appId = "" } = useParams();
  useSshKeyRequired(appDeployWithGitAddKeyUrl(appId));

  const [starter, setStarter] = useState<StarterOption>(customCodeOption);
  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));

  let query = "";
  if (starter) {
    const queryRaw: Record<string, string> = {};
    Object.keys(starter.query).forEach((key) => {
      queryRaw[key] = starter.query[key].join(",");
    });
    query = new URLSearchParams(queryRaw).toString();
  }

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Push your code to Aptible</h1>
        <p className="my-4 text-gray-600">
          We will look for a Dockerfile or generate one for you to deploy your
          app.
        </p>
      </div>

      <ProgressProject
        cur={2}
        prev={appDeployWithGitAddKeyUrl(appId)}
        next={appDeployConfigureUrl(appId, query)}
      />

      <Box className="w-full max-w-[700px] mx-auto">
        <div>
          <h4 className={tokens.type.h4}>
            Deploy Custom Code or Starter Template
          </h4>
          <div className="text-black-500 mb-1 mr-2">
            Launch your existing app with Custom Code, or learn how Aptible
            works with a Starter Template.
          </div>
          <div className="my-2">
            <Select
              options={starterTemplateOptions}
              value={starter?.value}
              onSelect={(val) => {
                setStarter(val as any);
              }}
              className="w-full"
            />
          </div>
          {starter && starter.value !== "none" ? (
            <div>
              What's inside this template?{" "}
              <ExternalLink
                href={`https://github.com/aptible/${starter.repo}`}
                variant="info"
              >
                View Source Code on GitHub
              </ExternalLink>
            </div>
          ) : null}
        </div>

        {starter && starter.value !== "none" ? (
          <>
            <div className="mt-4">
              <h4 className={tokens.type.h4}>Clone Template</h4>
              <PreCode
                segments={listToInvertedTextColor(["git clone", starter.value])}
                allowCopy
              />
            </div>

            <div className="mt-4">
              <h4 className={tokens.type.h4}>Select Template</h4>
              <PreCode
                segments={listToInvertedTextColor(["cd", starter.repo])}
                allowCopy
              />
            </div>
          </>
        ) : null}

        <div className="mt-4">
          <h4 className={tokens.type.h4}>Add Aptible's Git Server</h4>
          <PreCode
            segments={listToInvertedTextColor([
              "git remote add aptible",
              app.gitRepo,
            ])}
            allowCopy
          />
        </div>

        {starter && starter.value === "none" ? (
          <div className="mt-4">
            <h4 className={tokens.type.h4}>
              Configure database migrations (Optional)
            </h4>
            <div className="text-black-500 mr-2">
              1. Add a <Code>.aptible.yml</Code> file in the root directory of
              your app (see example below).
            </div>
            <div className="text-black-500 mb-1 mr-2">
              2. Commit your code changes.
            </div>
            <PreBox
              segments={listToInvertedTextColor([
                "before_release:\n",
                "  - python3 manage.py migrate",
              ])}
              allowCopy
            />
          </div>
        ) : null}

        <hr className="my-4" />

        <ButtonLink to={appDeployConfigureUrl(app.id, query)}>
          Configure
        </ButtonLink>
      </Box>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
