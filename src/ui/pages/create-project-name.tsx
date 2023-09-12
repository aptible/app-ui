import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { useApi, useLoaderSuccess, useQuery } from "saga-query/react";

import {
  createDeployApp,
  fetchAllStacks,
  fetchEnvironmentById,
  selectEnvironmentById,
  selectStackById,
  selectStackPublicDefault,
  stackToOption,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { createProject } from "@app/projects";
import {
  createProjectGitPushUrl,
  environmentDetailUrl,
  stackDetailEnvsUrl,
} from "@app/routes";
import { AppState } from "@app/types";

import { handleValidator } from "@app/validator";
import { AppSidebarLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  ButtonCreate,
  ButtonOwner,
  FormGroup,
  Input,
  ProgressProject,
  StackSelect,
  tokens,
} from "../shared";

const CreateAppPage = ({ envId }: { envId: string }) => {
  useQuery(fetchEnvironmentById({ id: envId }));
  const env = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: envId }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: env.stackId }),
  );
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const thunk = useApi(createDeployApp({ name, envId: env.id }));
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errorMsg = handleValidator(name);
    if (errorMsg) {
      setNameError(errorMsg);
    } else {
      setNameError("");
    }

    thunk.trigger();
  };
  const navigate = useNavigate();

  useLoaderSuccess(thunk, () => {
    navigate(createProjectGitPushUrl(thunk.meta.appId));
  });

  return (
    <div>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Name your App</h1>
      </div>

      <ProgressProject cur={1} />

      <Box className="w-full max-w-[700px] mx-auto">
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Stack"
            description={
              <p>
                The App will be created inside this{" "}
                <a
                  href="https://www.aptible.com/docs/stacks"
                  target="_blank"
                  rel="noreferrer"
                >
                  stack
                </a>
              </p>
            }
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <div id="stack">
              <Link to={stackDetailEnvsUrl(stack.id)} target="_blank">
                {stack.name}
              </Link>
            </div>
          </FormGroup>

          <FormGroup
            label="Environment"
            description={
              <p>
                The App will be created inside this{" "}
                <a
                  href="https://www.aptible.com/docs/environments"
                  target="_blank"
                  rel="noreferrer"
                >
                  environment
                </a>
              </p>
            }
            htmlFor="env"
            className="mb-4"
          >
            <div id="env">
              <Link to={environmentDetailUrl(env.id)} target="_blank">
                {env.handle}
              </Link>
            </div>
          </FormGroup>

          <FormGroup
            label="App Name"
            description="Lowercase alphanumerics, periods, dashes, and underscores only"
            htmlFor="name"
            feedbackVariant={nameError ? "danger" : "info"}
            feedbackMessage={nameError}
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
          </FormGroup>

          <BannerMessages {...thunk} className="my-2" />

          <ButtonCreate
            envId={envId}
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
            disabled={name === ""}
          >
            Create App
          </ButtonCreate>
        </form>
      </Box>
    </div>
  );
};

const CreateEnvironmentPage = ({ stackId }: { stackId: string }) => {
  const org = useSelector(selectOrganizationSelected);
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: stackId }),
  );
  const [stackValue, setStackValue] = useState(stackToOption(stack));
  useEffect(() => {
    setStackValue(stackToOption(stack));
  }, [stackId]);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const thunk = useApi(
    createProject({ name, stackId: stackValue.value, orgId: org.id }),
  );
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errorMsg = handleValidator(name);
    if (errorMsg) {
      setNameError(errorMsg);
    } else {
      setNameError("");
    }

    thunk.trigger();
  };
  const navigate = useNavigate();

  useLoaderSuccess(thunk, () => {
    navigate(createProjectGitPushUrl(thunk.meta.appId));
  });

  return (
    <div>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Name your Environment</h1>
        <p className="mt-4 mb-2 text-gray-600">
          An Aptible environment contains your app along with any required
          databases.
        </p>
      </div>

      <ProgressProject cur={1} />

      <Box className="w-full max-w-[700px] mx-auto">
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Stack"
            description={
              <p>
                The project will be created inside this{" "}
                <a
                  href="https://www.aptible.com/docs/stacks"
                  target="_blank"
                  rel="noreferrer"
                >
                  stack
                </a>
              </p>
            }
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <StackSelect
              value={stackValue.value}
              onSelect={(stack) => {
                setStackValue(stack);
              }}
            />
          </FormGroup>
          <FormGroup
            label="Environment Name"
            description="Lowercase alphanumerics, periods, dashes, and underscores only"
            htmlFor="name"
            feedbackVariant={nameError ? "danger" : "info"}
            feedbackMessage={nameError}
          >
            <Input
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              autoFocus
            />
          </FormGroup>

          <BannerMessages {...thunk} className="my-2" />

          <ButtonOwner
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
            disabled={name === ""}
          >
            Create Environment
          </ButtonOwner>
        </form>
      </Box>
    </div>
  );
};

export const CreateProjectNamePage = () => {
  const [params] = useSearchParams();
  const queryStackId = params.get("stack_id") || "";
  const queryEnvId = params.get("environment_id") || "";
  const defaultStack = useSelector(selectStackPublicDefault);
  const stackId = queryStackId || defaultStack.id;

  useQuery(fetchAllStacks());

  if (queryEnvId === "") {
    return (
      <AppSidebarLayout>
        <CreateEnvironmentPage stackId={stackId} />
      </AppSidebarLayout>
    );
  }

  return (
    <AppSidebarLayout>
      <CreateAppPage envId={queryEnvId} />
    </AppSidebarLayout>
  );
};
