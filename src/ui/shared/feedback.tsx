import { selectFeedback, setFeedback } from "@app/feedback";
import { SyntheticEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
    const w = window as any;
    if (w.aptible?.event) {
      if (freeformSurveyData) {
        w.aptible.event(feedbackEventName, freeformSurveyData);
      }
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
  );
};
