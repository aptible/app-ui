export type ProvisionableStatus =
  | 'pending'
  | 'provisioning'
  | 'provisioned'
  | 'deprovisioning'
  | 'deprovisioned'
  | 'provision_failed'
  | 'deprovision_failed';

export interface Provisionable {
  status: ProvisionableStatus;
}

export interface DeployImage {
  id: string;
  dockerRef: string;
  dockerRepo: string;
  gitRef: string;
  gitRepo: string;
  updatedAt: string;
  createdAt: string;
}

export interface DeployApp extends Provisionable {
  id: string;
  handle: string;
  gitRepo: string;
  createdAt: string;
  updatedAt: string;
  deploymentMethod: string;
  services: DeployService[];
  lastDeployOperation: DeployOperation | null;
  lastOperation: DeployOperation | null;
  environmentId: string;
  currentImage: DeployImage | null;
  currentConfigurationId: string;
}

export type InstanceClass = 't3' | 'm4' | 'r4' | 'r5' | 'c4' | 'c5';

export interface DeployService {
  id: string;
  handle: string;
  dockerRepo: string;
  dockerRef: string;
  processType: string;
  command: string;
  containerCount: number;
  containerMemoryLimitMb: number;
  instanceClass: InstanceClass;
  createdAt: string;
  updatedAt: string;
}

export interface DeployEndpoint extends Provisionable {
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
  platform: 'alb' | 'elb';
  type: string;
  createdAt: string;
  updatedAt: string;
  userDomain: string;
  virtualDomain: string;
  serviceId: string;
}

export interface DeployEnvironment {
  id: string;
  type: 'production' | 'development';
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
  createdAt: string;
  updatedAt: string;
  stackId: string;
}

export interface DeployStack {
  id: string;
  name: string;
  region: string;
  default: boolean;
  public: boolean;
  createdAt: string;
  updatedAt: string;
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

type OperationStatus = 'queued' | 'running' | 'failed' | 'succeeded';

export interface DeployOperation {
  id: string;
  resourceId: number;
  resourceType: string;
  type: string;
  status: OperationStatus;
  createdAt: string;
  updatedAt: string;
  gitRef: string;
  dockerRef: string;
  containerCount: string;
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

export interface DeployDisk {
  attached: boolean;
  availabilityZone: string;
  baselineIops: number;
  provisionedIops: number;
  createdAt: string;
  updatedAt: string;
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

export interface DeployDatabase extends Provisionable {
  connectionUrl: string;
  createdAt: string;
  updatedAt: string;
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

export interface ContainerProfile {
  name: string;
  costPerContainerHourInCents: number;
  cpuShare: number;
  minimumContainerSize: number;
  maximumContainerSize: number;
  maximumContainerCount: number;
}
