import { thunks } from "@app/api";
import { WebState, schema } from "@app/schema";
import { Feedback } from "@app/types";

export const selectFeedback = schema.feedback.select;
export const selectPreDeploySurveyAnswered = (state: WebState) =>
  selectFeedback(state).preDeploySurveyAnswered;
export const selectFreeformFeedbackGiven = (state: WebState) =>
  selectFeedback(state).freeformFeedbackGiven;

export const setFeedback = thunks.create<Feedback>(
  "set-feedback",
  function* (ctx, next) {
    yield* schema.update(schema.feedback.set(ctx.payload));
    yield* next();
  },
);
