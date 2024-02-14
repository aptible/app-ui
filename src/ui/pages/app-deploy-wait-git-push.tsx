import {
  fetchApp,
  hasDeployOperation,
  selectLatestDeployOp,
} from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { appDeployConfigureUrl, appDeployStatusUrl } from "@app/routes";
import { DeployOperation } from "@app/types";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AppSidebarLayout } from "..";
import { usePollAppOperations } from "../hooks";
import {
  Banner,
  Box,
  IconInfo,
  PreCode,
  ProgressProject,
  Tooltip,
  listToInvertedTextColor,
  tokens,
} from "../shared";

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

export const AppDeployWithGitPage = () => {
  const navigate = useNavigate();
  const { appId = "" } = useParams();

  useQuery(fetchApp({ id: appId }));
  usePollAppOperations(appId);
  const deployOp = useSelector((s) => selectLatestDeployOp(s, { appId }));

  useEffect(() => {
    if (deployOp && deployOp.status === "succeeded") {
      navigate(appDeployStatusUrl(appId));
    }
  }, [deployOp]);

  return (
    <AppSidebarLayout>
      <div className="text-center mt-10">
        <h1 className={tokens.type.h1}>Push your code to Aptible</h1>
        <p className="my-4 text-gray-600">
          We will look for a Dockerfile or generate one for you to deploy your
          app.
        </p>
      </div>

      <ProgressProject cur={2} prev={appDeployConfigureUrl(appId)} />

      <Box className="w-full max-w-[700px] mx-auto">
        <div className="mt-4">
          <div className="flex flex-row items-center">
            <h4 className={tokens.type.h4}>
              Push your code to our scan branch
            </h4>
            <Tooltip
              fluid
              text="If your local branch is named master, push to master"
            >
              <IconInfo
                className="opacity-50 hover:opacity-100 ml-1"
                variant="sm"
              />
            </Tooltip>
          </div>
          <PreCode
            segments={listToInvertedTextColor(["git push aptible", "main"])}
            allowCopy
          />
        </div>

        <hr className="my-4" />

        {hasDeployOperation(deployOp) ? (
          <OpResult op={deployOp} />
        ) : (
          <Banner variant="info">
            Waiting on your git push to continue...
          </Banner>
        )}
      </Box>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
