import type { DeployOperation, DeployService, OperationStatus } from "./deploy";

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

export interface Deployment {
  id: string;
  status: OperationStatus;
  dockerImage: string;
  dockerRepositoryUrl: string;
  gitRepositoryUrl: string;
  gitRef: string;
  gitCommitSha: string;
  gitCommitUrl: string;
  gitCommitMessage: string;
  gitCommitTimestamp: string | null;
  createdAt: string;
  updatedAt: string;
  operationId: string;
  appId: string;
  configurationId: string;
  imageId: string;
  sourceId: string;
}
