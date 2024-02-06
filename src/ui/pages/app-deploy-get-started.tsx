import { appDeployWithGitUrl, appDeployWithGithubUrl } from "@app/routes";
import { useParams } from "react-router";
import { GetStartedLayout } from "../layouts";
import { ButtonLink } from "../shared";

export const AppDeployGetStartedPage = () => {
  const { appId = "" } = useParams();

  return (
    <GetStartedLayout>
      <ButtonLink to={appDeployWithGithubUrl(appId)}>
        Deploy from Github
      </ButtonLink>
      <ButtonLink to={appDeployWithGitUrl(appId)}>
        Deploy with Git Push
      </ButtonLink>
    </GetStartedLayout>
  );
};
