import {
  cancelAppOpsPoll,
  fetchApp,
  pollAppOperations,
  selectAppById,
} from "@app/deploy";
import { hasDeployOperation, selectLatestDeployOp } from "@app/deploy";
import { useDispatch, useQuery, useSelector } from "@app/react";
import { appDeployConfigureUrl, appDeployGetStartedUrl } from "@app/routes";
import { DeployOperation } from "@app/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AppSidebarLayout } from "../layouts";
import {
  AppAutoDeployGuide,
  Banner,
  Box,
  Group,
  ProgressProject,
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

const OpResult = ({ op }: { op: DeployOperation }) => {
  const postfix = `operation: ${op.id}`;
  if (op.status === "failed") {
    return (
      <Banner variant="error">
        {op.type} operation failed, {postfix}
      </Banner>
    );
  }
  if (op.status === "succeeded") {
    return (
      <Banner variant="success">
        {op.type} success, {postfix}
      </Banner>
    );
  }
  if (op.status === "running") {
    return (
      <Banner variant="info">
        {op.type} detected (running), {postfix}
      </Banner>
    );
  }
  return (
    <Banner variant="info">
      {op.type} detected (queued), {postfix}
    </Banner>
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
        <h1 className={tokens.type.h1}>Push your code to GitHub</h1>
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

        <hr className="my-4" />

        <Group>
          {hasDeployOperation(deployOp) ? (
            <OpResult op={deployOp} />
          ) : (
            <Banner variant="info">
              Waiting for a deployment from your GitHub repo to continue ...
            </Banner>
          )}

          <Banner variant="info">
            Deploying a new App from GitHub might fail if you need environment
            variables or a database. But don't worry, the next step will let you
            configure those options and then re-deploy for you.
          </Banner>
        </Group>
      </Box>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
