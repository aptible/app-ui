import type { QueryState } from "starfx";

import type {
  DeployActivePlan,
  DeployActivityReport,
  DeployApp,
  DeployBackup,
  DeployBackupRetentionPolicy,
  DeployCertificate,
  DeployContainer,
  DeployDatabase,
  DeployDatabaseCredential,
  DeployDatabaseImage,
  DeployDisk,
  DeployEndpoint,
  DeployEnvironment,
  DeployImage,
  DeployLogDrain,
  DeployMetricDrain,
  DeployOperation,
  DeployPlan,
  DeployRelease,
  DeployService,
  DeployServiceDefinition,
  DeployStack,
  DeployVpcPeer,
  DeployVpnTunnel,
  Permission,
  Timestamps,
} from "./deploy";
import type { EntityMap } from "./hal";
import type { MapEntity } from "./helpers";
import type { Invitation } from "./invitations";
import type { ModalState } from "./modal";

export interface Env {
  isProduction: boolean;
  isDev: boolean;
  appUrl: string;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
  metricTunnelUrl: string;
  sentryDsn: string;
  legacyDashboardUrl: string;
  stripePublishableKey: string;
  origin: "app";
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
  selectedOrganizationId: string;
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
  updatedAt: string;
  reauthRequired: boolean;
  billingDetailId: string;
  ssoEnforced: boolean;
  city: string;
  address: string;
  emergencyPhone: string;
  opsAlertEmail: string;
  securityAlertEmail: string;
  primaryPhone: string;
  state: string;
  zip: string;
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

export interface AbstractResourceItem {
  id: string;
  type: "stack" | "environment" | "app" | "database" | "endpoint";
}

export interface ResourceStats extends AbstractResourceItem {
  count: number;
  lastAccessed: string;
}

export interface DeployAppConfigEnv {
  [key: string]: string | number | boolean;
}
export interface DeployAppConfig {
  id: string;
  env: DeployAppConfigEnv;
  appId: string;
}

export interface DeployState {
  apps: MapEntity<DeployApp>;
  appConfigs: MapEntity<DeployAppConfig>;
  certificates: MapEntity<DeployCertificate>;
  endpoints: MapEntity<DeployEndpoint>;
  environments: MapEntity<DeployEnvironment>;
  serviceDefinitions: MapEntity<DeployServiceDefinition>;
  stacks: MapEntity<DeployStack>;
  disks: MapEntity<DeployDisk>;
  databases: MapEntity<DeployDatabase>;
  databaseCredentials: MapEntity<DeployDatabaseCredential>;
  databaseImages: MapEntity<DeployDatabaseImage>;
  services: MapEntity<DeployService>;
  logDrains: MapEntity<DeployLogDrain>;
  metricDrains: MapEntity<DeployMetricDrain>;
  operations: MapEntity<DeployOperation>;
  activePlans: MapEntity<DeployActivePlan>;
  plans: MapEntity<DeployPlan>;
  permissions: MapEntity<Permission>;
  releases: MapEntity<DeployRelease>;
  containers: MapEntity<DeployContainer>;
  vpc_peers: MapEntity<DeployVpcPeer>;
  vpn_tunnels: MapEntity<DeployVpnTunnel>;
  backups: MapEntity<DeployBackup>;
  backupRps: MapEntity<DeployBackupRetentionPolicy>;
  activityReports: MapEntity<DeployActivityReport>;
  images: MapEntity<DeployImage>;
}

export type MetricHorizons = "1h" | "1d" | "1w";

export interface ContainerMetrics {
  id: string; // composite of containerId-metricName-metricTimeRange
  serviceId: string;
  containerId: string;
  metricName: string;
  metricLabel: string;
  metricTimeRange: MetricHorizons;
  values: { date: string; value: number }[];
}

export interface BillingDetail {
  id: string;
  paymentMethodUrl: string;
}

export interface AppState extends QueryState {
  env: Env;
  feedback: Feedback;
  users: MapEntity<User>;
  token: Token;
  elevatedToken: Token;
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
  resourceStats: MapEntity<ResourceStats>;
  containerMetrics: MapEntity<ContainerMetrics>;
  billingDetail: BillingDetail;
}

export interface DeployActivityRow extends DeployOperation {
  envHandle: string;
  resourceHandle: string;
  url?: string;
}
