import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Feedback } from "@app/types";

export const createFeedback = (e: Partial<Feedback> = {}): Feedback => {
  return {
    surveyAnswered: false,
    freeformFeedbackGiven: true,
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
export const selectSurveyAnswered = (state: AppState) =>
  selectFeedback(state).surveyAnswered;
export const selectFreeformFeedbackGiven = (state: AppState) =>
  selectFeedback(state).freeformFeedbackGiven;
