import { selectFeedback, setFeedback } from "@app/feedback";
import { useDispatch, useSelector } from "@app/react";
import { tunaEvent } from "@app/tuna";
import { type SyntheticEvent, useState } from "react";
import { Button, ButtonIcon } from "./button";
import { IconCheck, IconThumbsUp } from "./icons";
import { tokens } from "./tokens";

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
