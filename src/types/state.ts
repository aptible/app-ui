export interface Env {
  isProduction: boolean;
  isDev: boolean;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
}

export interface AppState {
  env: Env;
}
