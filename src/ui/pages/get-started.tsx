import {
  selectFeedback,
  selectPreDeploySurveyAnswered,
  setFeedback,
} from "@app/feedback";
import { useDispatch, useSelector } from "@app/react";
import { createEnvUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";
import { tunaEvent } from "@app/tuna";
import { SyntheticEvent, useState } from "react";
import { AppSidebarLayout, HeroBgLayout } from "../layouts";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonLink,
  CreateProjectFooter,
  Group,
  IconArrowRight,
  IconCheck,
  IconThumbsUp,
  tokens,
} from "../shared";

export const FreeFormSurvey = () => {
  const dispatch = useDispatch();
  const feedback = useSelector(selectFeedback);

  const [surveyDockerPushSet, setSurveyDockerPushSet] =
    useState<boolean>(false);
  const [surveyDockerComposeSet, setSurveyDockerComposeSet] =
    useState<boolean>(false);
  const [surveyGithubIntegrationSet, setSurveyGithubIntegration] =
    useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  if (feedbackSubmitted) {
    return (
      <h4 className={`${tokens.type.h4} text-center py-4`}>
        Thanks for your feedback!
      </h4>
    );
  }

  const handleSurveySubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    if (surveyDockerPushSet) {
      tunaEvent("feedback.survey.docker_push");
    }
    if (surveyDockerComposeSet) {
      tunaEvent("feedback.survey.docker_compose");
    }
    if (surveyGithubIntegrationSet) {
      tunaEvent("feedback.survey.github_integration");
    }
    dispatch(setFeedback({ ...feedback, preDeploySurveyAnswered: true }));
  };

  return (
    <>
      <h4 className={`${tokens.type.h4} text-center pb-4`}>
        Choose what Aptible should build next
      </h4>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex">
          <Button
            className="w-full pointer-events-none text-bold text-gray-500"
            variant="white"
          >
            Deploy with Docker Push
          </Button>
          <ButtonIcon
            className="ml-4 pr-2"
            onClick={() => setSurveyDockerPushSet(!surveyDockerPushSet)}
            icon={
              surveyDockerPushSet ? (
                <IconCheck color="#FFF" />
              ) : (
                <IconThumbsUp color="#FFF" />
              )
            }
            variant={surveyDockerPushSet ? "success" : "secondary"}
          />
        </div>
        <div className="flex">
          <Button
            className="w-full pointer-events-none text-bold text-gray-500"
            variant="white"
          >
            Deploy with Docker Compose
          </Button>
          <ButtonIcon
            className="ml-4 pr-2"
            onClick={() => setSurveyDockerComposeSet(!surveyDockerComposeSet)}
            icon={
              surveyDockerComposeSet ? (
                <IconCheck color="#FFF" />
              ) : (
                <IconThumbsUp color="#FFF" />
              )
            }
            variant={surveyDockerComposeSet ? "success" : "secondary"}
          />
        </div>
        <div className="flex">
          <Button
            className="w-full pointer-events-none text-bold text-gray-500"
            variant="white"
          >
            Deploy with GitHub Integration
          </Button>
          <ButtonIcon
            className="ml-4 pr-2"
            onClick={() =>
              setSurveyGithubIntegration(!surveyGithubIntegrationSet)
            }
            icon={
              surveyGithubIntegrationSet ? (
                <IconCheck color="#FFF" />
              ) : (
                <IconThumbsUp color="#FFF" />
              )
            }
            variant={surveyGithubIntegrationSet ? "success" : "secondary"}
          />
        </div>
        {(surveyDockerPushSet ||
          surveyDockerComposeSet ||
          surveyGithubIntegrationSet) && (
          <Button onClick={handleSurveySubmit} variant="secondary">
            Submit Feedback
          </Button>
        )}
      </div>
    </>
  );
};

export const GetStartedPage = () => {
  const preDeploySurveyAnswered = useSelector(selectPreDeploySurveyAnswered);
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);
  const Wrapper = isUserAuthenticated ? AppSidebarLayout : HeroBgLayout;

  return (
    <Wrapper>
      <div className="flex flex-col items-center">
        <div className="max-w-[600px]">
          <div className="text-center mt-10">
            <h1 className={tokens.type.h1}>Deploy your App</h1>
            <p className="my-6 text-gray-600 w-full mx-auto">
              Control your AWS resources, guarantee uptime, and achieve
              enterprise best practices without building your own internal
              developer platform.
            </p>
          </div>

          <Box className="w-full mx-auto">
            <Group>
              <ButtonLink to={createEnvUrl()} className="font-bold">
                Get Started
                <IconArrowRight variant="sm" className="ml-2" />
              </ButtonLink>
            </Group>

            {!preDeploySurveyAnswered && (
              <>
                <hr className="h-px mt-6 mb-4 bg-gray-200 border-0 dark:bg-gray-700" />
                <FreeFormSurvey />
              </>
            )}
          </Box>

          <div className="mt-6 w-full mx-auto">
            <CreateProjectFooter />
          </div>
        </div>
      </div>
      <div className="bg-[url('/background-pattern-v2.png')] bg-no-repeat bg-cover bg-center absolute w-full h-full top-0 left-0 z-[-999]" />
    </Wrapper>
  );
};
