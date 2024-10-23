import type { LinkResponse } from "./hal";
import type { Timestamps } from "./helpers";

export type ProvisionableStatus =
  | "pending"
  | "provisioning"
  | "provisioned"
  | "deprovisioning"
  | "deprovisioned"
  | "provision_failed"
  | "deprovision_failed"
  | "unknown";

export interface Provisionable {
  status: ProvisionableStatus;
}

export interface DeployImage extends Timestamps {
  id: string;
  dockerRef: string;
  dockerRepo: string;
  gitRef: string;
  gitRepo: string;
  exposedPorts: number[];
}

export interface DeployApp extends Provisionable, Timestamps {
  id: string;
  handle: string;
  gitRepo: string;
  deploymentMethod: string;
  environmentId: string;
  currentConfigurationId: string;
  currentImageId: string;
  currentDeploymentId: string;
  currentSourceId: string;
}

export type InstanceClass = "m4" | "m5" | "r4" | "r5" | "c4" | "c5";

export interface DeployService extends Timestamps {
  id: string;
  appId: string;
  databaseId: string;
  environmentId: string;
  serviceSizingPolicyId: string;
  handle: string;
  dockerRepo: string;
  dockerRef: string;
  processType: string;
  command: string;
  containerCount: number;
  containerMemoryLimitMb: number;
  currentReleaseId: string;
  instanceClass: InstanceClass;
  forceZeroDowntime: boolean;
  naiveHealthCheck: boolean;
}

export interface AcmeChallenge {
  from: { name: string };
  method: string;
  to: { name: string; legacy: boolean }[];
}

export interface AcmeConfiguration {
  challenges: AcmeChallenge[];
  names: string[];
}

export type AcmeStatus = "pending" | "transitioning" | "ready";

export type EndpointType =
  | "http"
  | "http_proxy_protocol"
  | "tcp"
  | "tls"
  | "grpc"
  | "unknown";

export interface DeployEndpoint extends Provisionable, Timestamps {
  id: string;
  acme: boolean;
  acmeConfiguration: AcmeConfiguration | null;
  acmeDnsChallengeHost: string;
  acmeStatus: AcmeStatus;
  containerExposedPorts: any;
  containerPort: string;
  containerPorts: string[];
  default: boolean;
  dockerName: string;
  externalHost: string;
  externalHttpPort: string;
  externalHttpsPort: string;
  internal: boolean;
  ipWhitelist: string[];
  platform: "alb" | "elb";
  type: EndpointType;
  userDomain: string;
  virtualDomain: string;
  serviceId: string;
  certificateId: string;
}

export type OnboardingStatus =
  | "initiated"
  | "scanned"
  | "db_provisioned"
  | "app_provisioned"
  | "completed"
  | "unknown";

export interface DeployEnvironment extends Timestamps {
  id: string;
  organizationId: string;
  type: "production" | "development";
  handle: string;
  activated: boolean;
  sweetnessStack: string;
  stackId: string;
  onboardingStatus: OnboardingStatus;
  totalAppCount: number;
  totalDatabaseCount: number;
}

export interface DeployEnvironmentStats {
  id: string;
  containerCount: number;
  domainCount: number;
  totalDiskSize: number;
  appContainerCount: number;
  databaseContainerCount: number;
  totalBackupSize: number;
}

export interface DeployStack extends Timestamps {
  id: string;
  name: string;
  region: string;
  default: boolean;
  public: boolean;
  outboundIpAddresses: string[];
  memoryLimits: boolean;
  cpuLimits: boolean;
  intrusionDetection: boolean;
  exposeIntrusionDetectionReports: boolean;
  allowTInstanceProfile: boolean;
  allowCInstanceProfile: boolean;
  allowMInstanceProfile: boolean;
  allowRInstanceProfile: boolean;
  allowGranularContainerSizes: boolean;
  verticalAutoscaling: boolean;
  horizontalAutoscaling: boolean;
  organizationId: string;
  internalDomain: string;
  defaultDomain: string;
  selfHosted: boolean;
  awsAccountId: string;
}

export type OperationStatus =
  | "queued"
  | "running"
  | "failed"
  | "succeeded"
  | "unknown";

export type ResourceType =
  | "app"
  | "certificate"
  | "service"
  | "database"
  | "database_credential"
  | "vhost"
  | "log_drain"
  | "metric_drain"
  | "backup"
  | "image"
  | "ephemeral_session"
  | "plan"
  | "active_plan"
  | "release"
  | "container"
  | "vpc_peer"
  | "vpn_tunnel"
  | "unknown";

// https://github.com/aptible/deploy-api/blob/3b197beaa5bcbbed991c1eac73d5c99a4fdf8f95/app/models/operation.rb#L54
export type OperationType =
  | "audit"
  | "backup"
  | "captain_comeback_restart"
  | "configure"
  | "clone"
  | "copy"
  | "deploy"
  | "deprovision"
  | "drain"
  | "evacuate"
  | "execute"
  | "get"
  | "index"
  | "logs"
  | "modify"
  | "poll"
  | "provision"
  | "ps"
  | "purge"
  | "rebuild"
  | "recover"
  | "recover_recreate"
  | "reload"
  | "renew"
  | "replicate"
  | "replicate_logical"
  | "restart"
  | "restart_recreate"
  | "run_recipe"
  | "scale"
  | "scan"
  | "scan_code"
  | "set"
  | "show"
  | "sync"
  | "tunnel"
  | "unknown";

export interface DeployOperation extends Timestamps {
  id: string;
  environmentId: string;
  codeScanResultId: string;
  resourceId: string;
  resourceType: ResourceType;
  type: OperationType;
  status: OperationStatus;
  gitRef: string;
  dockerRef: string;
  containerCount: number;
  containerSize: number;
  diskSize: number;
  encryptedEnvJsonNew: string;
  destinationRegion: string;
  cancelled: boolean;
  aborted: boolean;
  automated: boolean;
  immediate: boolean;
  provisionedIops: number;
  ebsVolumeType: string;
  encryptedStackSettings: string;
  instanceProfile: string;
  userEmail: string;
  userName: string;
  env: { [key: string]: string | null };
  note: string;
}

export interface DeployDisk extends Timestamps {
  attached: boolean;
  availabilityZone: string;
  baselineIops: number;
  provisionedIops: number;
  currentKmsArn: string;
  device: string;
  ebsVolumeId: string;
  ebsVolumeType: string;
  ec2InstanceId: string;
  filesystem: string;
  handle: string;
  host: string;
  id: string;
  size: number;
  keyBytes: number;
  environmentId: string;
  databaseId: string;
}

export interface DeployDatabase extends Provisionable, Timestamps {
  connectionUrl: string;
  currentKmsArn: string;
  dockerRepo: string;
  handle: string;
  id: string;
  environmentId: string;
  provisioned: boolean;
  enableBackups: boolean;
  type: string;
  diskId: string;
  serviceId: string;
  databaseImageId: string;
  initializeFrom: string;
  portMapping: [number, number][];
}

export interface DeployDatabaseCredential {
  id: string;
  default: boolean;
  connectionUrl: string;
  databaseId: string;
  type: string;
}

export interface DeployDatabaseImage extends Timestamps {
  id: string;
  default: boolean;
  description: string;
  discoverable: boolean;
  dockerRepo: string;
  eolAt: string;
  type: string;
  version: string;
  visible: boolean;
}

export interface ContainerProfile {
  name: string;
  costPerContainerGBHourInCents: number;
  cpuShare: number;
  minimumContainerSize: number;
  maximumContainerSize: number;
  maximumContainerCount: number;
}

// there are two legacy types we DO NOT allow creating: elasticsearch / https
export type LogDrainType =
  | "logdna"
  | "papertrail"
  | "tail"
  | "elasticsearch_database"
  | "sumologic"
  | "https_post"
  | "datadog"
  | "syslog_tls_tcp"
  | "insightops";

export interface DeployLogDrain extends Provisionable, Timestamps {
  id: string;
  handle: string;
  drainType: LogDrainType;
  drainHost: string;
  drainPort: string;
  drainUsername: string;
  drainPassword: string;
  url: string;
  loggingToken: string;
  drainApps: boolean;
  drainDatabases: boolean;
  drainEphemeralSessions: boolean;
  drainProxies: boolean;
  environmentId: string;
  databaseId: string;
  backendChannel: string;
}

export interface DeployMetricDrain extends Provisionable, Timestamps {
  id: string;
  handle: string;
  drainType: string;
  agggregatorCaCertificate: string;
  aggregatorCaPrivateKeyBlob: string;
  aggregatorHost: string;
  aggregatorPortMapping: number[][];
  aggregatorInstanceId: string;
  aggregatorDockerName: string;
  aggregatorAllocation: string[];
  drainConfiguration: any;
  environmentId: string;
  databaseId: string;
}

export interface DeployCertificate extends Timestamps {
  id: string;
  commonName: string;
  certificateBody: string;
  notBefore: string;
  notAfter: string;
  issuerCountry?: string;
  issuerOrganization?: string;
  issuerWebsite?: string;
  issuerCommonName?: string;
  subjectCountry?: string;
  subjectState?: string;
  subjectLocale?: string;
  subjectOrganization?: string;
  acme: boolean;
  leafCertificate: string;
  certificateChain: string;
  sha256Fingerprint: string;
  trusted: boolean;
  selfSigned: boolean;
  subjectAlternativeNames: string[];
  privateKeyAlgorithm: string;
  privateKey: string;
  environmentId: string;
}

export interface DeployServiceDefinition extends Timestamps {
  id: string;
  appId: string;
  command: string;
  processType: string;
}

export interface DeployPrereleaseCommand extends Timestamps {
  id: string;
  appId: string;
  command: string;
  index: number;
}

export type PlanName =
  | "starter"
  | "development"
  | "growth"
  | "scale"
  | "production"
  | "enterprise"
  | "none";
export interface DeployPlan extends Timestamps {
  id: string;
  automatedBackupLimitPerDb: number;
  complianceDashboardAccess: boolean;
  containerMemoryLimit: number;
  costCents: number;
  cpuAllowedProfiles: any;
  createdAt: string;
  diskLimit: number;
  environmentLimit?: number;
  ephemeralSessionLimit: number;
  includedContainerMb: number;
  includedDiskGb: number;
  includedVhosts: number;
  manualBackupLimitPerDb: number;
  name: PlanName;
  updatedAt: string;
  vhostLimit: number;
}

export interface DeployActivePlan extends Omit<DeployPlan, "name"> {
  availablePlans: string[];
  organizationId: string;
  planId: string;
}

export type PermissionScope =
  | "unknown"
  | "basic_read"
  | "read"
  | "admin"
  | "observability"
  | "deploy"
  | "sensitive"
  | "tunnel"
  | "destroy";
export interface Permission {
  id: string;
  environmentId: string;
  roleId: string;
  scope: PermissionScope;
  inheritedFrom: string;
}

export interface DeployRelease extends Timestamps {
  id: string;
  dockerRef: string;
  dockerRepo: string;
  serviceId: string;
}

export interface DeployContainer extends Timestamps {
  id: string;
  awsInstanceId: string;
  createdAt: string;
  dockerName: string;
  host: string;
  layer: string;
  memoryLimit: number;
  port: number;
  portMapping: number[][];
  status: string;
  updatedAt: string;
  releaseId: string;
}

export interface DeployVpcPeer extends Timestamps {
  id: string;
  connectionId: string;
  connectionStatus: string;
  createdAt: string;
  description: string;
  peerAccountId: string;
  peerVpcId: string;
  stackId: string;
  updatedAt: string;
}

export interface DeployVpnTunnel extends Timestamps {
  id: string;
  createdAt: string;
  handle: string;
  phase1Alg: string;
  phase1DhGroup: string;
  phase1Lifetime: string;
  phase2Alg: string;
  phase2DhGroup: string;
  phase2Lifetime: string;
  perfectForwardSecrecy: string;
  ourGateway: string;
  ourNetworks: string[];
  peerGateway: string;
  peerNetworks: string[];
  stackId: string;
  updatedAt: string;
  state: DeployVpnTunnelState;
  auto: string;
  tunnelAttributes: DeployVpnTunnelAttributes;
}

export type DeployVpnTunnelState = "up" | "down" | "partial" | "unknown";

export interface DeployVpnTunnelAttributes {
  connections: {
    [key: string]: {
      name: string;
      local_address: string;
      remote_address: string;
      state: string;
    };
  } | null;
  routed_connections: {
    [key: string]: {
      name: string;
      local_address: string;
      remote_address: string;
      req_id: string;
    };
  } | null;
  security_associations: {
    [key: string]: {
      id: string;
      local: string;
      remote: string;
      status: string;
      status_time: string;
      linked_routes: string[];
    };
  } | null;
}

export interface DeployBackup {
  id: string;
  awsRegion: string;
  createdByEmail: string;
  manual: boolean;
  size: number;
  createdAt: string;
  copiedFromId: string;
  environmentId: string;
  databaseId: string;
  databaseHandle: string;
  createdFromOperationId: string;
}

export interface DeployBackupRetentionPolicy {
  id: string;
  daily: number;
  monthly: number;
  yearly: number;
  makeCopy: boolean;
  keepFinal: boolean;
  environmentId: string;
  createdAt: string;
}

export const containerProfileKeys: InstanceClass[] = [
  "m4",
  "m5",
  "r4",
  "r5",
  "c4",
  "c5",
];
export type ContainerProfileData = {
  name: string;
  costPerContainerGBHourInCents: number;
  cpuShare: number;
  minimumContainerSize: number;
  maximumContainerSize: number;
  maximumContainerCount: number;
};

export interface DeployActivityReport extends Timestamps {
  id: string;
  startsAt: string;
  endsAt: string;
  filename: string;
  environmentId: string;
}

export interface DeployServiceResponse {
  id: number;
  handle: string;
  created_at: string;
  updated_at: string;
  docker_repo: string;
  docker_ref: string;
  process_type: string;
  command: string;
  container_count: number | null;
  container_memory_limit_mb: number | null;
  instance_class: InstanceClass;
  force_zero_downtime: boolean;
  naive_health_check: boolean;
  _links: {
    current_release: LinkResponse;
    app?: LinkResponse;
    database?: LinkResponse;
    account: LinkResponse;
    service_sizing_policy?: LinkResponse;
  };
  _type: "service";
}

export interface DeployAppConfigEnv {
  [key: string]: string | null;
}

export interface DeployAppConfig {
  id: string;
  env: DeployAppConfigEnv;
  appId: string;
}

export type AutoscalingTypes = "vertical" | "horizontal";

export interface DeployServiceSizingPolicy extends Timestamps {
  id: string;
  environmentId: string;
  autoscaling: AutoscalingTypes;
  scalingEnabled: boolean;
  defaultPolicy: boolean;
  metricLookbackSeconds: number;
  percentile: number;
  postScaleUpCooldownSeconds: number;
  postScaleDownCooldownSeconds: number;
  postReleaseCooldownSeconds: number;
  memCpuRatioRThreshold: number;
  memCpuRatioCThreshold: number;
  memScaleUpThreshold: number;
  memScaleDownThreshold: number;
  minimumMemory: number;
  maximumMemory: number | null;
  minContainers: number | null;
  maxContainers: number | null;
  minCpuThreshold: number | null;
  maxCpuThreshold: number | null;
  scaleUpStep: number;
  scaleDownStep: number;
}

export interface DeploySource {
  id: string;
  displayName: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeployDiskResponse {
  attached: boolean;
  availability_zone: string;
  baseline_iops: number;
  provisioned_iops: number;
  created_at: string;
  updated_at: string;
  current_kms_arn: string;
  device: string;
  ebs_volume_id: string;
  ebs_volume_type: string;
  instance_id: string;
  filesystem: string;
  handle: string;
  host: string;
  id: string;
  size: number;
  key_bytes: number;
  _type: "disk";
  _links: {
    database: LinkResponse;
    account: LinkResponse;
  };
}
