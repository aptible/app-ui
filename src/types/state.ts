import { MapEntity, LoadingItemState } from 'robodux';

export interface Env {
  isProduction: boolean;
  isDev: boolean;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  otpEnabled: boolean;
  superuser: boolean;
  username: string;
  verified: boolean;
}

export interface Token {
  tokenId: string;
  accessToken: string;
  userUrl: string;
  actorUrl: string;
}

export interface AppState {
  env: Env;
  loaders: { [key: string]: LoadingItemState };
  users: MapEntity<User>;
  currentUser: User;
  token: Token;
}
