import {
  type BillingDetail,
  type Config,
  type Dashboard,
  type DeployActivePlan,
  type DeployActivityReport,
  type DeployApp,
  type DeployAppConfig,
  type DeployBackup,
  type DeployBackupRetentionPolicy,
  type DeployCertificate,
  type DeployContainer,
  type DeployCost,
  type DeployCostRates,
  type DeployDatabase,
  type DeployDatabaseCredential,
  type DeployDatabaseImage,
  type DeployDisk,
  type DeployEndpoint,
  type DeployEnvironment,
  type DeployEnvironmentStats,
  type DeployImage,
  type DeployLogDrain,
  type DeployMetricDrain,
  type DeployOperation,
  type DeployPlan,
  type DeployRelease,
  type DeployService,
  type DeployServiceDefinition,
  type DeployServiceSizingPolicy,
  type DeploySource,
  type DeployStack,
  type DeployVpcPeer,
  type DeployVpnTunnel,
  type Deployment,
  type GithubIntegration,
  type InstanceClass,
  type Invitation,
  type ManualScaleRecommendation,
  type Membership,
  ModalType,
  type Organization,
  type Otp,
  type Permission,
  type Role,
  type Theme,
  type Token,
  type User,
} from "@app/types";

export const DEFAULT_INSTANCE_CLASS: InstanceClass = "m5";

export const defaultConfig = (e: Partial<Config> = {}): Config => {
  return {
    isProduction: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    isTest: false,
    appUrl: import.meta.env.VITE_APP_URL || "",
    authUrl: import.meta.env.VITE_AUTH_URL || "",
    billingUrl: import.meta.env.VITE_BILLING_URL || "",
    apiUrl: import.meta.env.VITE_API_URL || "",
    metricTunnelUrl: import.meta.env.VITE_METRIC_TUNNEL_URL || "",
    portalUrl: import.meta.env.VITE_PORTAL_URL || "",
    aptibleAiUrl: import.meta.env.VITE_APTIBLE_AI_URL || "",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || "",
    origin: (import.meta.env.VITE_ORIGIN as any) || "app",
    betaFeatureOrgIds:
      import.meta.env.VITE_FEATURE_BETA_ORG_IDS ||
      "df0ee681-9e02-4c28-8916-3b215d539b08",
    tokenHeaderOrgIds:
      import.meta.env.VITE_TOKEN_HEADER_ORG_IDS ||
      "df0ee681-9e02-4c28-8916-3b215d539b08",
    legacyDashboardUrl:
      import.meta.env.VITE_LEGACY_DASHBOARD_URL ||
      "https://dashboard.aptible.com",
    mintlifyChatKey:
      import.meta.env.VITE_MINTLIFY_CHAT_KEY ||
      "mint_dsc_XXXXXXXXXXXXXXXXXXXXXXXX",
    stripePublishableKey:
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      "pk_test_eiw5HXHTAgTwyNnV9I5ruCrA",
    ...e,
  };
};

export const defaultDeployApp = (a: Partial<DeployApp> = {}): DeployApp => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    gitRepo: "",
    createdAt: now,
    updatedAt: now,
    deploymentMethod: "",
    status: "unknown",
    environmentId: "",
    currentConfigurationId: "",
    currentDeploymentId: "",
    currentImageId: "",
    currentSourceId: "",
    ...a,
  };
};

export const defaultDeployAppConfig = (
  a: Partial<DeployAppConfig> = {},
): DeployAppConfig => {
  return {
    id: "",
    env: {},
    appId: "",
    ...a,
  };
};

export const defaultDeployCertificate = (
  c: Partial<DeployCertificate> = {},
): DeployCertificate => {
  const now = new Date().toISOString();
  return {
    id: "",
    commonName: "",
    certificateBody: "",
    notBefore: now,
    notAfter: now,
    issuerCountry: "",
    issuerOrganization: "",
    issuerWebsite: "",
    issuerCommonName: "",
    subjectCountry: "",
    subjectState: "",
    subjectLocale: "",
    subjectOrganization: "",
    acme: false,
    leafCertificate: "",
    certificateChain: "",
    sha256Fingerprint: "",
    trusted: false,
    selfSigned: true,
    subjectAlternativeNames: [],
    privateKeyAlgorithm: "",
    privateKey: "",
    createdAt: now,
    updatedAt: now,
    environmentId: "",
    ...c,
  };
};

export const defaultDeployEndpoint = (
  e: Partial<DeployEndpoint> = {},
): DeployEndpoint => {
  const now = new Date().toISOString();
  return {
    id: "",
    status: "pending",
    acme: false,
    acmeConfiguration: null,
    acmeDnsChallengeHost: "",
    acmeStatus: "pending",
    containerExposedPorts: [],
    containerPort: "",
    containerPorts: [],
    default: false,
    dockerName: "",
    externalHost: "",
    externalHttpPort: "",
    externalHttpsPort: "",
    internal: false,
    ipWhitelist: [],
    platform: "elb",
    type: "unknown",
    tokenHeader: undefined,
    createdAt: now,
    updatedAt: now,
    userDomain: "",
    virtualDomain: "",
    serviceId: "",
    certificateId: "",
    ...e,
  };
};

export const defaultDeployEnvironment = (
  e: Partial<DeployEnvironment> = {},
): DeployEnvironment => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    handle: "Unknown",
    createdAt: now,
    updatedAt: now,
    type: "development",
    activated: true,
    totalAppCount: 0,
    totalDatabaseCount: 0,
    sweetnessStack: "",
    stackId: "",
    onboardingStatus: "unknown",
    ...e,
  };
};

export const defaultDeployEnvironmentStats = (
  e: Partial<DeployEnvironmentStats> = {},
): DeployEnvironmentStats => {
  return {
    id: "",
    containerCount: 0,
    domainCount: 0,
    totalDiskSize: 0,
    appContainerCount: 0,
    databaseContainerCount: 0,
    totalBackupSize: 0,
    ...e,
  };
};

export const defaultDeployServiceDefinition = (
  e: Partial<DeployServiceDefinition> = {},
): DeployServiceDefinition => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    id: "",
    appId: "",
    command: "",
    processType: "",
    ...e,
  };
};

export const defaultDeployStack = (
  s: Partial<DeployStack> = {},
): DeployStack => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    name: "",
    region: "",
    default: false,
    public: false,
    createdAt: now,
    updatedAt: now,
    outboundIpAddresses: [],
    memoryLimits: false,
    cpuLimits: false,
    intrusionDetection: false,
    exposeIntrusionDetectionReports: false,
    allowCInstanceProfile: false,
    allowMInstanceProfile: false,
    allowRInstanceProfile: false,
    allowTInstanceProfile: false,
    allowGranularContainerSizes: false,
    verticalAutoscaling: false,
    horizontalAutoscaling: false,
    internalDomain: "aptible.in",
    defaultDomain: "on-aptible.com",
    selfHosted: false,
    awsAccountId: "",
    ...s,
  };
};

export const defaultDeployDisk = (d: Partial<DeployDisk> = {}): DeployDisk => {
  const now = new Date().toISOString();
  return {
    id: "",
    attached: true,
    availabilityZone: "",
    baselineIops: 0,
    databaseId: "",
    provisionedIops: 3000,
    createdAt: now,
    updatedAt: now,
    currentKmsArn: "",
    device: "",
    ebsVolumeId: "",
    ebsVolumeType: "",
    ec2InstanceId: "",
    environmentId: "",
    filesystem: "",
    handle: "",
    host: "",
    size: 10,
    keyBytes: 32,
    ...d,
  };
};

export const defaultDeployDatabase = (
  d: Partial<DeployDatabase> = {},
): DeployDatabase => {
  const now = new Date().toISOString();
  return {
    id: "",
    databaseImageId: "",
    status: "pending",
    handle: "",
    connectionUrl: "",
    createdAt: now,
    updatedAt: now,
    currentKmsArn: "",
    dockerRepo: "",
    provisioned: false,
    enableBackups: true,
    type: "",
    environmentId: "",
    serviceId: "",
    diskId: "",
    initializeFrom: "",
    portMapping: [],
    ...d,
  };
};

export const defaultDatabaseCredential = (
  p: Partial<DeployDatabaseCredential> = {},
): DeployDatabaseCredential => {
  return {
    id: "",
    databaseId: "",
    connectionUrl: "",
    type: "",
    default: false,
    ...p,
  };
};

export const defaultDeployDatabaseImage = (
  db: Partial<DeployDatabaseImage> = {},
): DeployDatabaseImage => {
  const now = new Date().toISOString();
  return {
    id: "",
    default: false,
    description: "",
    discoverable: false,
    dockerRepo: "",
    eolAt: "",
    type: "",
    version: "",
    visible: true,
    createdAt: now,
    updatedAt: now,
    ...db,
  };
};

export const defaultDeployService = (
  s: Partial<DeployService> = {},
): DeployService => {
  const now = new Date().toISOString();
  return {
    id: "",
    appId: "",
    databaseId: "",
    environmentId: "",
    serviceSizingPolicyId: "",
    handle: "",
    dockerRef: "",
    dockerRepo: "",
    processType: "",
    command: "",
    containerCount: 0,
    containerMemoryLimitMb: 512,
    currentReleaseId: "",
    instanceClass: DEFAULT_INSTANCE_CLASS,
    forceZeroDowntime: false,
    naiveHealthCheck: false,
    createdAt: now,
    updatedAt: now,
    ...s,
  };
};

export const defaultDeployLogDrain = (
  ld: Partial<DeployLogDrain> = {},
): DeployLogDrain => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drainType: "tail",
    drainHost: "",
    drainPort: "",
    drainUsername: "",
    drainPassword: "",
    url: "",
    loggingToken: "",
    drainApps: false,
    drainProxies: false,
    drainEphemeralSessions: false,
    drainDatabases: false,
    environmentId: "",
    databaseId: "",
    backendChannel: "",
    createdAt: now,
    updatedAt: now,
    status: "pending",
    ...ld,
  };
};

export const defaultDeployMetricDrain = (
  md: Partial<DeployMetricDrain> = {},
): DeployMetricDrain => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    drainType: "",
    agggregatorCaCertificate: "",
    aggregatorCaPrivateKeyBlob: "",
    aggregatorHost: "",
    aggregatorPortMapping: [],
    aggregatorInstanceId: "",
    aggregatorDockerName: "",
    aggregatorAllocation: [],
    drainConfiguration: {},
    environmentId: "",
    databaseId: "",
    createdAt: now,
    updatedAt: now,
    status: "pending",
    ...md,
  };
};

export const defaultDeployOperation = (
  op: Partial<DeployOperation> = {},
): DeployOperation => {
  const now = new Date().toISOString();
  return {
    id: "",
    environmentId: "",
    codeScanResultId: "",
    resourceId: "",
    resourceType: "unknown",
    type: "unknown",
    status: "unknown",
    createdAt: now,
    updatedAt: now,
    gitRef: "",
    dockerRef: "",
    instanceProfile: "",
    containerCount: -1,
    containerSize: -1,
    diskSize: 0,
    encryptedEnvJsonNew: "",
    destinationRegion: "",
    cancelled: false,
    aborted: false,
    automated: false,
    immediate: false,
    provisionedIops: 0,
    ebsVolumeType: "",
    encryptedStackSettings: "",
    userName: "unknown",
    userEmail: "",
    env: {},
    note: "",
    ...op,
  };
};

export const defaultPlan = (c: Partial<DeployPlan> = {}): DeployPlan => {
  const now = new Date().toISOString();
  return {
    id: "",
    automatedBackupLimitPerDb: 0,
    complianceDashboardAccess: false,
    containerMemoryLimit: 0,
    costCents: 0,
    cpuAllowedProfiles: 0,
    createdAt: now,
    diskLimit: 0,
    environmentLimit: undefined,
    ephemeralSessionLimit: 0,
    includedContainerMb: 0,
    includedDiskGb: 0,
    includedVhosts: 0,
    manualBackupLimitPerDb: 0,
    name: "none",
    updatedAt: now,
    vhostLimit: 0,
    horizontalAutoscaling: false,
    verticalAutoscaling: false,
    ...c,
  };
};

export const defaultActivePlan = (
  c: Partial<DeployActivePlan> = {},
): DeployActivePlan => {
  const now = new Date().toISOString();
  return {
    id: "",
    automatedBackupLimitPerDb: 0,
    availablePlans: ["starter", "development", "growth", "scale", "production"],
    complianceDashboardAccess: false,
    containerMemoryLimit: 0,
    costCents: 0,
    cpuAllowedProfiles: 0,
    createdAt: now,
    diskLimit: 0,
    environmentLimit: undefined,
    ephemeralSessionLimit: 0,
    includedContainerMb: 0,
    includedDiskGb: 0,
    includedVhosts: 0,
    manualBackupLimitPerDb: 0,
    organizationId: "",
    updatedAt: now,
    vhostLimit: 0,
    horizontalAutoscaling: false,
    verticalAutoscaling: false,
    planId: "",
    ...c,
  };
};

export const defaultPermission = (r: Partial<Permission> = {}): Permission => {
  return {
    id: "",
    scope: "unknown",
    environmentId: "",
    roleId: "",
    inheritedFrom: "",
    ...r,
  };
};

export const defaultDeployRelease = (
  r: Partial<DeployRelease> = {},
): DeployRelease => {
  const now = new Date().toISOString();
  return {
    id: "",
    dockerRef: "",
    dockerRepo: "",
    createdAt: now,
    updatedAt: now,
    serviceId: "",
    ...r,
  };
};

export const defaultDeployContainer = (
  c: Partial<DeployContainer> = {},
): DeployContainer => {
  const now = new Date().toISOString();
  return {
    id: "",
    awsInstanceId: "",
    dockerName: "",
    host: "",
    layer: "",
    memoryLimit: 0,
    port: 0,
    portMapping: [],
    status: "",
    createdAt: now,
    updatedAt: now,
    releaseId: "",
    ...c,
  };
};

export const defaultDeployVpcPeer = (
  s: Partial<DeployVpcPeer> = {},
): DeployVpcPeer => {
  const now = new Date().toISOString();
  return {
    id: "",
    connectionId: "",
    connectionStatus: "",
    description: "",
    peerAccountId: "",
    peerVpcId: "",
    createdAt: now,
    updatedAt: now,
    stackId: "",
    ...s,
  };
};

export const defaultDeployVpnTunnel = (
  s: Partial<DeployVpnTunnel> = {},
): DeployVpnTunnel => {
  const now = new Date().toISOString();
  return {
    id: "",
    handle: "",
    phase1Alg: "",
    phase1DhGroup: "",
    phase1Lifetime: "",
    phase2Alg: "",
    phase2DhGroup: "",
    phase2Lifetime: "",
    ourGateway: "",
    ourNetworks: [],
    peerGateway: "",
    peerNetworks: [],
    perfectForwardSecrecy: "",
    state: "unknown",
    auto: "",
    tunnelAttributes: {
      connections: {},
      routed_connections: {},
      security_associations: {},
    },
    createdAt: now,
    updatedAt: now,
    stackId: "",
    ...s,
  };
};

export const defaultDeployBackup = (
  b: Partial<DeployBackup> = {},
): DeployBackup => {
  const now = new Date().toISOString();
  return {
    id: "",
    databaseHandle: "",
    awsRegion: "",
    createdByEmail: "",
    databaseId: "",
    environmentId: "",
    createdFromOperationId: "",
    copiedFromId: "",
    size: 0,
    manual: false,
    createdAt: now,
    ...b,
  };
};

export const defaultBackupRp = (
  bk: Partial<DeployBackupRetentionPolicy> = {},
): DeployBackupRetentionPolicy => {
  const now = new Date().toISOString();
  // based on https://github.com/aptible/deploy-api/blob/b537960533f3cb6fb8f57f339de3a46207e70f4b/app/models/backup_retention_policy.rb#L8
  return {
    id: "",
    daily: 90,
    monthly: 72,
    yearly: 0,
    makeCopy: true,
    keepFinal: true,
    environmentId: "",
    createdAt: now,
    ...bk,
  };
};

export const defaultDeployActivityReport = (
  ld: Partial<DeployActivityReport> = {},
): DeployActivityReport => {
  const now = new Date().toISOString();
  return {
    id: "",
    startsAt: now,
    endsAt: now,
    filename: "",
    environmentId: "",
    createdAt: now,
    updatedAt: now,
    ...ld,
  };
};

export const defaultDeployImage = (
  img: Partial<DeployImage> = {},
): DeployImage => {
  const now = new Date().toISOString();
  return {
    id: "",
    gitRepo: "",
    gitRef: "Not used",
    dockerRepo: "",
    exposedPorts: [],
    dockerRef: "",
    createdAt: now,
    updatedAt: now,
    ...img,
  };
};

export const defaultServiceSizingPolicy = (
  m: Partial<DeployServiceSizingPolicy> = {},
): DeployServiceSizingPolicy => {
  const now = new Date().toISOString();
  return {
    id: "",
    environmentId: "",
    autoscaling: "vertical",
    scalingEnabled: false,
    defaultPolicy: false,
    metricLookbackSeconds: 300,
    percentile: 99,
    postScaleUpCooldownSeconds: 60,
    postScaleDownCooldownSeconds: 300,
    postReleaseCooldownSeconds: 300,
    memCpuRatioRThreshold: 4,
    memCpuRatioCThreshold: 2,
    memScaleUpThreshold: 0.9,
    memScaleDownThreshold: 0.75,
    minimumMemory: 2048,
    maximumMemory: null,
    minContainers: 2,
    maxContainers: 4,
    minCpuThreshold: 0.1,
    maxCpuThreshold: 0.9,
    scaleUpStep: 1,
    scaleDownStep: 1,
    createdAt: now,
    updatedAt: now,
    ...m,
  };
};

export const defaultInvitation = (i?: Partial<Invitation>): Invitation => {
  const now = new Date().toISOString();
  return {
    id: "",
    email: "",
    createdAt: now,
    updatedAt: now,
    organizationId: "",
    organizationName: "",
    inviterName: "",
    roleName: "",
    expired: false,
    ...i,
  };
};

export const defaultOrganization = (
  o: Partial<Organization> = {},
): Organization => ({
  id: "",
  name: "",
  billingDetailId: "",
  ssoEnforced: false,
  updatedAt: new Date().toISOString(),
  reauthRequired: false,
  address: "",
  city: "",
  zip: "",
  state: "",
  securityAlertEmail: "",
  opsAlertEmail: "",
  emergencyPhone: "",
  primaryPhone: "",
  ...o,
});

export const defaultOtp = (o: Partial<Otp> = {}): Otp => {
  return {
    id: "",
    uri: "",
    recoveryCodesUrl: "",
    currentUrl: "",
    ...o,
  };
};

export const defaultToken = (t: Partial<Token> = {}): Token => {
  return {
    tokenId: "",
    accessToken: "",
    userUrl: "",
    actorUrl: "",
    ...t,
  };
};

export const defaultUser = (u: Partial<User> = {}): User => {
  return {
    id: "",
    name: "Aptible",
    email: "",
    otpEnabled: false,
    superuser: false,
    readOnlyImpersonate: false,
    username: "",
    verified: false,
    currentOtpId: "",
    externalId: "",
    selectedOrganizationId: "",
    createdAt: new Date().toISOString(),
    ...u,
  };
};

export const defaultBillingDetail = (
  bt: Partial<BillingDetail> = {},
): BillingDetail => {
  return {
    id: "",
    paymentMethodUrl: "",
    organizationDetailsJson: {},
    ...bt,
  };
};

export const defaultTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }
  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const defaultModal = () => {
  return {
    type: ModalType.NONE,
    props: {} as any,
  };
};

export const defaultRole = (r: Partial<Role> = {}): Role => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    name: "",
    type: "platform_user",
    scimCreated: false,
    createdAt: now,
    updatedAt: now,
    ...r,
  };
};

export const defaultMembership = (m: Partial<Membership> = {}): Membership => {
  const now = new Date().toISOString();
  return {
    id: "",
    userId: "",
    roleId: "",
    privileged: false,
    createdAt: now,
    updatedAt: now,
    ...m,
  };
};

export const defaultDeployment = (a: Partial<Deployment> = {}): Deployment => {
  const now = new Date().toISOString();
  return {
    id: "",
    dockerImage: "",
    dockerRepositoryUrl: "",
    status: "unknown",
    gitRepositoryUrl: "",
    gitRef: "",
    gitCommitSha: "",
    gitCommitUrl: "",
    gitCommitMessage: "",
    gitCommitTimestamp: "",
    createdAt: now,
    updatedAt: now,
    appId: "",
    operationId: "",
    imageId: "",
    configurationId: "",
    sourceId: "",
    ...a,
  };
};

export const defaultDeploySource = (
  s: Partial<DeploySource> = {},
): DeploySource => {
  const now = new Date().toISOString();
  return {
    id: "",
    displayName: "Unknown",
    url: "",
    createdAt: now,
    updatedAt: now,
    ...s,
  };
};

export const defaultGithubIntegration = (
  s: Partial<GithubIntegration> = {},
): GithubIntegration => {
  const now = new Date().toISOString();
  return {
    id: "",
    organizationId: "",
    installationId: "",
    accountName: "",
    avatarUrl: "",
    installed: true,
    active: true,
    installationUrl: "",
    createdAt: now,
    updatedAt: now,
    ...s,
  };
};

export const defaultDashboard = (s: Partial<Dashboard> = {}): Dashboard => {
  return {
    id: "",
    ...s,
  };
};

export const defaultManualScaleRecommendation = (
  s: Partial<ManualScaleRecommendation> = {},
): ManualScaleRecommendation => {
  const now = new Date().toISOString();
  return {
    id: "",
    serviceId: "",
    cpuUsage: 0,
    ramUsage: 0,
    ramTarget: 0,
    costSavings: 0,
    recommendedInstanceClass: "",
    recommendedContainerMemoryLimitMb: 0,
    metricPercentile: 0,
    createdAt: now,
    ...s,
  };
};

export const defaultCost = (s: Partial<DeployCost> = {}): DeployCost => {
  return {
    id: "",
    estCost: 0,
    resourceType: "",
    ...s,
  };
};

export const defaultCostRates = (
  s: Partial<DeployCostRates> = {},
): DeployCostRates => {
  return {
    hids_cost_per_month: 0.02,
    vpn_tunnel_cost_per_month: 99.0,
    stack_cost_per_month: 499.0,
    backup_cost_gb_per_month: 0.02,
    disk_cost_gb_per_month: 0.2,
    disk_iops_cost_per_month: 0.01,
    vhost_cost_per_hour: 0.06,
    m_class_gb_per_hour: 0.08,
    c_class_gb_per_hour: 0.1,
    r_class_gb_per_hour: 0.05,
    ...s,
  };
};
