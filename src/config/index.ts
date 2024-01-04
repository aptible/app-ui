import { WebState, db } from "@app/schema";

export const selectEnv = db.env.select;
export const selectOrigin = (state: WebState) => selectEnv(state).origin;
export const selectLegacyDashboardUrl = (state: WebState) =>
  selectEnv(state).legacyDashboardUrl;
