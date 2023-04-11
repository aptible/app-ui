import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Env } from "@app/types";

export const createEnv = (e: Partial<Env> = {}): Env => {
  return {
    isProduction: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    authUrl: import.meta.env.VITE_AUTH_URL || "",
    billingUrl: import.meta.env.VITE_BILLING_URL || "",
    apiUrl: import.meta.env.VITE_API_URL || "",
    legacyDashboardUrl:
      import.meta.env.VITE_LEGACY_DASHBOARD_URL ||
      "https://dashboard.aptible.com",
    origin: (import.meta.env.VITE_ORIGIN as any) || "nextgen",
    ...e,
  };
};

export const ENV_NAME = "env";
const env = createAssign<Env>({
  name: ENV_NAME,
  initialState: createEnv(),
});

export const { set: setEnv, reset: resetEnv } = env.actions;
export const reducers = createReducerMap(env);
export const selectEnv = (state: AppState) => state[ENV_NAME];
export const selectOrigin = (state: AppState) => selectEnv(state).origin;
export const selectLegacyDashboardUrl = (state: AppState) =>
  selectEnv(state).legacyDashboardUrl;
