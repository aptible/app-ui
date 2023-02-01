import { LinkResponse } from "./hal";

export type ProvisionableStatus =
  | "pending"
  | "provisioning"
  | "provisioned"
  | "deprovisioning"
  | "deprovisioned"
  | "provision_failed"
  | "deprovision_failed";

export interface Provisionable {
  status: ProvisionableStatus;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface DeployImage extends Timestamps {
  id: string;
  dockerRef: string;
  dockerRepo: string;
  gitRef: string;
  gitRepo: string;
}

export interface DeployApp extends Provisionable, Timestamps {
  id: string;
  handle: string;
  gitRepo: string;
  deploymentMethod: string;
  lastDeployOperation: DeployOperation | null;
  lastOperation: DeployOperation | null;
  environmentId: string;
  currentImage: DeployImage | null;
  currentConfigurationId: string;
  serviceIds: string[];
}

export type InstanceClass = "t3" | "m4" | "r4" | "r5" | "c4" | "c5";

export interface DeployService extends Timestamps {
  id: string;
  handle: string;
  dockerRepo: string;
  dockerRef: string;
  processType: string;
  command: string;
  containerCount: number;
  containerMemoryLimitMb: number;
  instanceClass: InstanceClass;
}

export interface DeployEndpoint extends Provisionable, Timestamps {
  id: string;
  acme: boolean;
  acmeConfiguration: any;
  acmeDnsChallengeHost: string;
  acmeStatus: string;
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
  type: string;
  userDomain: string;
  virtualDomain: string;
  serviceId: string;
}

export interface DeployEnvironment extends Timestamps {
  id: string;
  type: "production" | "development";
  handle: string;
  activated: boolean;
  containerCount: number;
  domainCount: number;
  totalDiskSize: number;
  totalAppCount: number;
  appContainerCount: number;
  databaseContainerCount: number;
  totalDatabaseCount: number;
  sweetnessStack: string;
  totalBackupSize: number;
  stackId: string;
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
  organizationId: string;
}

export type OperationStatus = "queued" | "running" | "failed" | "succeeded";

export interface DeployOperation extends Timestamps {
  id: string;
  resourceId: number;
  resourceType: string;
  type: string;
  status: OperationStatus;
  gitRef: string;
  dockerRef: string;
  containerCount: number;
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
  env: any;
}

export interface DeployOperationResponse {
  id: number;
  type: string;
  status: OperationStatus;
  user_name: string;
  updated_at: string;
  _links: {
    resource: LinkResponse;
  };
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
}

export interface DeployDatabase extends Provisionable, Timestamps {
  connectionUrl: string;
  currentKmsArn: string;
  dockerRepo: string;
  handle: string;
  id: string;
  lastOperation: DeployOperation | null;
  environmentId: string;
  provisioned: boolean;
  type: string;
  disk: DeployDisk | null;
  serviceId: string;
}

export interface DeployDatabaseImage extends Timestamps {
  id: string;
  default: boolean;
  description: string;
  discoverable: boolean;
  dockerRepo: string;
  type: string;
  version: string;
  visible: boolean;
}

export interface ContainerProfile {
  name: string;
  costPerContainerHourInCents: number;
  cpuShare: number;
  minimumContainerSize: number;
  maximumContainerSize: number;
  maximumContainerCount: number;
}

export interface DeployLogDrain extends Provisionable, Timestamps {
  id: string;
  handle: string;
  drainType: string;
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
}
