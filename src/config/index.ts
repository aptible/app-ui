import { WebState, schema } from "@app/schema";

export const selectEnv = schema.env.select;
export const selectOrigin = (state: WebState) => selectEnv(state).origin;
export const selectLegacyDashboardUrl = (state: WebState) =>
  selectEnv(state).legacyDashboardUrl;
