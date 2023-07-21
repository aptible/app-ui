import { SyntheticEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectFeedback,
  selectPreDeploySurveyAnswered,
  setFeedback,
} from "@app/feedback";
import { createProjectGitUrl } from "@app/routes";
import { selectIsUserAuthenticated } from "@app/token";

import { CreateProjectLayout, HeroBgLayout } from "../layouts";
import {
  Box,
  Button,
  ButtonIcon,
  ButtonLink,
  CreateProjectFooter,
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
    const w = window as any;
    if (w.aptible?.event) {
      if (surveyDockerPushSet) {
        w.aptible.event("feedback.survey.docker_push", null);
      }
      if (surveyDockerComposeSet) {
        w.aptible.event("feedback.survey.docker_compose", null);
      }
      if (surveyGithubIntegrationSet) {
        w.aptible.event("feedback.survey.github_integration", null);
      }
    }
    dispatch(setFeedback({ ...feedback, preDeploySurveyAnswered: true }));
  };

  return (
    <>
      <h4 className={`${tokens.type.h4} text-center py-4`}>
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

export const CreateProjectPage = () => {
  const preDeploySurveyAnswered = useSelector(selectPreDeploySurveyAnswered);
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated);
  const Wrapper = isUserAuthenticated ? CreateProjectLayout : HeroBgLayout;

  return (
    <Wrapper>
      <div className="text-center mt-16">
        <h1 className={tokens.type.h1}>Deploy your App</h1>
        <p className="my-6 text-gray-600">
          Aptible is the{" "}
          <span className="text-black font-bold">No Infrastructure</span>{" "}
          Platform as a Service that startups use to deploy in seconds, scale
          infinitely, and forget about infrastructure.
        </p>
      </div>
      <Box>
        <ButtonLink to={createProjectGitUrl()} className="font-bold">
          Deploy with Git Push
          <IconArrowRight className="ml-2" />
        </ButtonLink>
        {!preDeploySurveyAnswered && (
          <>
            <hr className="h-px mt-8 mb-4 bg-gray-200 border-0 dark:bg-gray-700" />
            <FreeFormSurvey />
          </>
        )}
      </Box>

      <div className="mt-6">
        <CreateProjectFooter />
      </div>
    </Wrapper>
  );
};
