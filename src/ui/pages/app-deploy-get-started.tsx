import { appDeployWithGitUrl, appDeployWithGithubUrl } from "@app/routes";
import { useParams } from "react-router";
import { GetStartedLayout } from "../layouts";
import { ButtonLink, IconGithub } from "../shared";

export const AppDeployGetStartedPage = () => {
  const { appId = "" } = useParams();

  return (
    <GetStartedLayout>
      <ButtonLink to={appDeployWithGithubUrl(appId)}>
        <IconGithub variant="sm" className="mr-1" /> Deploy from Github
      </ButtonLink>
      <ButtonLink to={appDeployWithGitUrl(appId)}>
        Deploy with Git Push
      </ButtonLink>
    </GetStartedLayout>
  );
};
