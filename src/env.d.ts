interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  REACT_APP_APTIBLE_AUTH_ROOT_URL: string;
  REACT_APP_BILLING_ROOT_URL: string;
  REACT_APP_API_ROOT_URL: string;
}
