import { type WebState, schema } from "@app/schema";

export const selectEnv = schema.env.select;
export const selectOrigin = (state: WebState) => selectEnv(state).origin;
export const selectLegacyDashboardUrl = (state: WebState) =>
  selectEnv(state).legacyDashboardUrl;
export const selectPortalUrl = (state: WebState) => selectEnv(state).portalUrl;
export const selectAptibleAiUrl = (state: WebState) =>
  selectEnv(state).aptibleAiUrl;
