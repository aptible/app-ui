import {
  createDeployApp,
  createDeployEnvironment,
  fetchEnvironmentById,
  selectDefaultStack,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { useApi, useLoaderSuccess, useQuery, useSelector } from "@app/react";
import {
  appDeployGetStartedUrl,
  createAppUrl,
  createEnvUrl,
  createStackUrl,
  environmentDetailUrl,
  stackDetailUrl,
} from "@app/routes";
import { handleRegexExplainer, handleValidator } from "@app/validator";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link, useSearchParams } from "react-router-dom";
import { AppSidebarLayout } from "../layouts";
import {
  BannerMessages,
  Box,
  Button,
  ButtonAnyOwner,
  ButtonCreate,
  EnvironmentSelect,
  FormGroup,
  FormGroupFeedback,
  Input,
  ProgressProject,
  StackSelect,
  tokens,
} from "../shared";

export const CreateAppPage = () => {
  const [params] = useSearchParams();
  const envId = params.get("environment_id") || "";
  useQuery(fetchEnvironmentById({ id: envId }));
  const env = useSelector((s) => selectEnvironmentById(s, { id: envId }));
  const stack = useSelector((s) => selectStackById(s, { id: env.stackId }));
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
    navigate(appDeployGetStartedUrl(thunk.meta.appId));
  });

  return (
    <AppSidebarLayout>
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
                  Stack
                </a>
              </p>
            }
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <div id="stack">
              <Link to={stackDetailUrl(stack.id)} target="_blank">
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
                  Environment
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
            description={handleRegexExplainer}
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
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};

export const CreateEnvironmentPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const queryStackId = params.get("stack_id") || "";
  const org = useSelector(selectOrganizationSelected);
  const defaultStack = useSelector(selectDefaultStack);

  const [stackId, setStackId] = useState(queryStackId || defaultStack.id);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const thunk = useApi(
    createDeployEnvironment({ name, stackId, orgId: org.id }),
  );

  useEffect(() => {
    setStackId(queryStackId);
  }, [queryStackId]);
  useEffect(() => {
    if (queryStackId) return;
    setStackId(defaultStack.id);
  }, [defaultStack.id]);

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

  useLoaderSuccess(thunk, () => {
    navigate(createAppUrl(`environment_id=${thunk.meta.id}`));
  });

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Name your Environment</h1>
        <p className="mt-4 mb-8 text-gray-600">
          An Aptible environment contains your app along with any required
          databases.
        </p>
      </div>

      <Box className="w-full max-w-[700px] mx-auto">
        <form onSubmit={onSubmit}>
          <BannerMessages {...thunk} className="my-2" />

          <FormGroup
            label="Stack"
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <StackSelect
              value={stackId}
              onSelect={(opt) => {
                setStackId(opt.value);
              }}
            />
            <FormGroupFeedback>
              Need a new dedicated stack?{" "}
              <Link to={createStackUrl()}>Request a new stack.</Link>
            </FormGroupFeedback>
          </FormGroup>

          <FormGroup
            label="Environment Name"
            description={handleRegexExplainer}
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

          <ButtonAnyOwner
            className="mt-4 w-full"
            type="submit"
            isLoading={thunk.isLoading}
            disabled={name === ""}
          >
            Create Environment
          </ButtonAnyOwner>
        </form>
      </Box>

      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};

export const EnvSelectorPage = ({
  onSuccess,
}: { onSuccess?: (p: { stackId: string; envId: string }) => void }) => {
  const [params] = useSearchParams();
  const queryStackId = params.get("stack_id") || "";
  const defaultStack = useSelector(selectDefaultStack);
  const [stackId, setStackId] = useState(queryStackId || defaultStack.id);
  const [envId, setEnvId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setStackId(queryStackId);
  }, [queryStackId]);
  useEffect(() => {
    if (queryStackId) return;
    setStackId(defaultStack.id);
  }, [defaultStack.id]);
  useEffect(() => {
    // when we change the stack we need to reset the env selector
    setEnvId("");
  }, [stackId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess({ stackId, envId });
    } else {
      navigate(createAppUrl(`stack_id=${stackId}&environment_id=${envId}`));
    }
  };

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Choose your Environment</h1>
        <p className="mt-4 mb-8 text-gray-600">
          An Aptible environment is a container for your Apps and Databases.
        </p>
      </div>

      <Box className="w-full max-w-[700px] mx-auto">
        <form onSubmit={onSubmit}>
          <FormGroup
            label="Stack"
            htmlFor="stack"
            feedbackVariant="info"
            className="mb-4"
          >
            <StackSelect
              value={stackId}
              onSelect={(opt) => {
                setStackId(opt.value);
              }}
            />
            <FormGroupFeedback>
              Need a new dedicated stack?{" "}
              <Link to={createStackUrl()}>Request Stack</Link>
            </FormGroupFeedback>
          </FormGroup>

          <FormGroup label="Environment" htmlFor="env-select">
            <EnvironmentSelect
              onSelect={(opt) => {
                setEnvId(opt.value);
              }}
              value={envId}
              stackId={stackId}
              ariaLabel="env-select"
            />
            <FormGroupFeedback>
              Need a new environment?{" "}
              <Link to={createEnvUrl()}>Create Environment</Link>
            </FormGroupFeedback>
          </FormGroup>

          <Button
            className="mt-4 w-full"
            type="submit"
            disabled={!stackId || !envId}
          >
            Next
          </Button>
        </form>
      </Box>

      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
