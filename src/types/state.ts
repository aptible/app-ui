import type { QueryState } from "@app/fx";

import type {
  DeployActivePlan,
  DeployApp,
  DeployCertificate,
  DeployDatabase,
  DeployDatabaseImage,
  DeployDisk,
  DeployEndpoint,
  DeployEnvironment,
  DeployLogDrain,
  DeployMetricDrain,
  DeployOperation,
  DeployPlan,
  DeployService,
  DeployServiceDefinition,
  DeployStack,
  Permission,
  Timestamps,
} from "./deploy";
import type { EntityMap } from "./hal";
import type { MapEntity } from "./helpers";
import type { Invitation, InvitationRequest } from "./invitations";
import type { ModalState } from "./modal";

export interface Env {
  isProduction: boolean;
  isDev: boolean;
  appUrl: string;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
  sentryDsn: string;
  legacyDashboardUrl: string;
  origin: "nextgen" | "app";
}

export interface Feedback {
  preDeploySurveyAnswered: boolean;
  freeformFeedbackGiven: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  otpEnabled: boolean;
  superuser: boolean;
  readOnlyImpersonate: boolean;
  username: string;
  verified: boolean;
  currentOtpId: string;
}

export interface Token {
  tokenId: string;
  accessToken: string;
  userUrl: string;
  actorUrl: string;
}

export type RoleType = "owner" | "platform_owner" | "platform_user";
export interface Role extends Timestamps {
  id: string;
  name: string;
  type: RoleType;
  organizationId: string;
}

export interface AuthApiError {
  message: string;
  error: string;
  code: number;
  exception_context: { [key: string]: any };
}

export interface Organization {
  id: string;
  name: string;
}

export interface U2fDevice {
  id: string;
  name: string;
  version: string;
  keyHandle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Otp {
  id: string;
  uri: string;
  recoveryCodesUrl: string;
  currentUrl: string;
}

export type Theme = "light" | "dark";

export interface Nav {
  collapsed: boolean;
}

export interface DeployState {
  apps: MapEntity<DeployApp>;
  certificates: MapEntity<DeployCertificate>;
  endpoints: MapEntity<DeployEndpoint>;
  environments: MapEntity<DeployEnvironment>;
  serviceDefinitions: MapEntity<DeployServiceDefinition>;
  stacks: MapEntity<DeployStack>;
  disks: MapEntity<DeployDisk>;
  databases: MapEntity<DeployDatabase>;
  databaseImages: MapEntity<DeployDatabaseImage>;
  services: MapEntity<DeployService>;
  logDrains: MapEntity<DeployLogDrain>;
  metricDrains: MapEntity<DeployMetricDrain>;
  operations: MapEntity<DeployOperation>;
  active_plans: MapEntity<DeployActivePlan>;
  plans: MapEntity<DeployPlan>;
  permissions: MapEntity<Permission>;
}

export interface AppState extends QueryState {
  env: Env;
  feedback: Feedback;
  users: MapEntity<User>;
  token: Token;
  elevatedToken: Token;
  invitationRequest: InvitationRequest;
  invitations: MapEntity<Invitation>;
  entities: EntityMap;
  redirectPath: string;
  organizationSelected: string;
  organizations: MapEntity<Organization>;
  u2fDevices: MapEntity<U2fDevice>;
  otp: Otp;
  data: MapEntity<any>;
  theme: Theme;
  nav: Nav;
  deploy: DeployState;
  modal: ModalState;
  roles: MapEntity<Role>;
  currentUserRoles: string[];
  signal: AbortController;
}
