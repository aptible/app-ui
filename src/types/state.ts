import type { DeployOperation, DeployService, Timestamps } from "./deploy";

export interface Config {
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

export interface Deployment {
  id: string;
  dockerTag: string;
  gitHead: string;
  dockerSha: string;
  modifiedEnvKeys: string[];
  gitSha: string;
  createdAt: string;
  updatedAt: string;
  appId: string;
  operationId: string;
  configurationId: string;
  imageId: string;
  sourceId: string;
}

export interface DeployActivityRow extends DeployOperation {
  envHandle: string;
  resourceHandle: string;
  url?: string;
}

export interface DeployServiceRow extends DeployService {
  envHandle: string;
  resourceHandle: string;
  cost: number;
  url?: string;
}
