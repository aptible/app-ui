import { MapEntity, LoadingItemState } from 'robodux';
import { InvitationRequest, Invitation } from './invitations';
import { EntityMap } from './hal';

export interface Env {
  isProduction: boolean;
  isDev: boolean;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
  origin: 'deploy';
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

export interface AuthApiError {
  message: string;
  error: string;
  code: number;
  exception_context: { [key: string]: any };
}

export interface AuthLoaderMessage {
  error: string;
  code: number;
  exception_context: { [key: string]: any };
}

export type AuthLoader = LoadingItemState<AuthLoaderMessage>;

export interface Organization {
  id: string;
  name: string;
}

export interface AppState {
  env: Env;
  authLoader: AuthLoader;
  loaders: { [key: string]: LoadingItemState };
  users: MapEntity<User>;
  token: Token;
  elevatedToken: Token;
  invitationRequest: InvitationRequest;
  invitations: MapEntity<Invitation>;
  entities: EntityMap;
  redirectPath: string;
  organizationSelected: string;
  organizations: MapEntity<Organization>;
}
