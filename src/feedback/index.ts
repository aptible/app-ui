import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Feedback } from "@app/types";

export const createFeedback = (e: Partial<Feedback> = {}): Feedback => {
  return {
    preDeploySurveyAnswered: e.preDeploySurveyAnswered || false,
    freeformFeedbackGiven: e.freeformFeedbackGiven || false,
  };
};

export const FEEDBACK_NAME = "feedback";
const feedback = createAssign<Feedback>({
  name: FEEDBACK_NAME,
  initialState: createFeedback(),
});

export const { set: setFeedback, reset: resetFeedback } = feedback.actions;
export const reducers = createReducerMap(feedback);
export const selectFeedback = (state: AppState) => state[FEEDBACK_NAME];
export const selectPreDeploySurveyAnswered = (state: AppState) =>
  selectFeedback(state).preDeploySurveyAnswered;
export const selectFreeformFeedbackGiven = (state: AppState) =>
  selectFeedback(state).freeformFeedbackGiven;
