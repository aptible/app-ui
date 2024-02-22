import { fetchApp, selectAppById } from "@app/deploy";
import { selectLatestDeployOp } from "@app/deploy";
import { useQuery, useSelector } from "@app/react";
import { appDeployConfigureUrl, appDeployGetStartedUrl } from "@app/routes";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { AppSidebarLayout } from "../layouts";
import {
  AppAutoDeployGuide,
  Box,
  ButtonLink,
  ProgressProject,
  tokens,
} from "../shared";

export const AppDeployWithGithubPage = () => {
  const navigate = useNavigate();
  const { appId = "" } = useParams();
  useQuery(fetchApp({ id: appId }));
  const app = useSelector((s) => selectAppById(s, { id: appId }));
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
          Deploy your app with our custom GitHub Workflow.
        </p>
      </div>

      <ProgressProject
        cur={2}
        prev={appDeployGetStartedUrl(appId)}
        next={appDeployConfigureUrl(appId)}
      />

      <Box className="w-full max-w-[700px] mx-auto">
        <AppAutoDeployGuide app={app} />

        <div className="mt-4">
          <hr />
          <ButtonLink to={appDeployConfigureUrl(app.id)} className="mt-4">
            Configure App
          </ButtonLink>
        </div>
      </Box>

      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </AppSidebarLayout>
  );
};
