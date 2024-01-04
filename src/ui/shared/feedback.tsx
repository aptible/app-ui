import { selectFeedback, setFeedback } from "@app/feedback";
import { useDispatch, useSelector } from "@app/react";
import { tunaEvent } from "@app/tuna";
import { SyntheticEvent, useState } from "react";
import { Button } from "./button";
import { FormGroup } from "./form-group";
import { StatusBox } from "./status-box";
import { tokens } from "./tokens";

export const FeedbackForm = ({
  description,
  feedbackEventName,
}: { description: string; feedbackEventName: string }) => {
  const dispatch = useDispatch();
  const feedback = useSelector(selectFeedback);
  const [freeformSurveyData, setFreeFormSurveyData] = useState<string>("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const handleFeedbackSubmission = (e: SyntheticEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    if (freeformSurveyData) {
      tunaEvent(feedbackEventName, freeformSurveyData);
    }
    dispatch(setFeedback({ ...feedback, freeformFeedbackGiven: true }));
  };

  if (feedbackSubmitted) {
    return (
      <StatusBox>
        <h4 className={`${tokens.type.h4} text-center py-4`}>
          Thanks for your feedback!
        </h4>
      </StatusBox>
    );
  }

  const submitButtonClass = freeformSurveyData
    ? "mt-4"
    : "mt-4 disabled pointer-events-none hover:bg-indigo-300 bg-indigo-300";
  const maxFreeformSurveyDataLength = 300;

  return (
    <div className="mb-7">
      <StatusBox>
        <h4 className={tokens.type.h4} />
        <FormGroup
          label="Share Feedback"
          htmlFor="feedback"
          description={description}
        >
          <textarea
            maxLength={maxFreeformSurveyDataLength}
            name="feedback"
            className={tokens.type.textarea}
            value={freeformSurveyData}
            onChange={(e) => setFreeFormSurveyData(e.currentTarget.value)}
          />
        </FormGroup>
        <div>
          <div className="float-right mr-2">
            <p className="text-right text-sm">
              {freeformSurveyData.length} / {maxFreeformSurveyDataLength}
            </p>
          </div>
          <div>
            <Button
              disabled={!freeformSurveyData}
              type="submit"
              variant="secondary"
              className={submitButtonClass}
              onClick={handleFeedbackSubmission}
              isLoading={false}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </StatusBox>
    </div>
  );
};
