import {
  BillingDetail,
  Config,
  DeployActivePlan,
  DeployActivityReport,
  DeployApp,
  DeployAppConfig,
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
  DeployEnvironmentStats,
  DeployImage,
  DeployLogDrain,
  DeployMetricDrain,
  DeployOperation,
  DeployPlan,
  DeployRelease,
  DeployService,
  DeployServiceDefinition,
  DeployServiceSizingPolicy,
  DeployStack,
  DeployVpcPeer,
  DeployVpnTunnel,
  Deployment,
  Invitation,
  Membership,
  ModalType,
  Organization,
  Otp,
  Permission,
  Role,
  Theme,
  Token,
  User,
} from "@app/types";

export const defaultConfig = (e: Partial<Config> = {}): Config => {
  return {
    isProduction: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    appUrl: import.meta.env.VITE_APP_URL || "",
    authUrl: import.meta.env.VITE_AUTH_URL || "",
    billingUrl: import.meta.env.VITE_BILLING_URL || "",
    apiUrl: import.meta.env.VITE_API_URL || "",
    metricTunnelUrl: import.meta.env.VITE_METRIC_TUNNEL_URL || "",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || "",
    origin: (import.meta.env.VITE_ORIGIN as any) || "app",
    legacyDashboardUrl:
      import.meta.env.VITE_LEGACY_DASHBOARD_URL ||
      "https://dashboard.aptible.com",
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
    status: "pending",
    environmentId: "",
    currentConfigurationId: "",
    currentDeploymentId: "",
    currentImageId: "",
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
    provisionedIops: 0,
    createdAt: now,
    updatedAt: now,
    currentKmsArn: "",
    device: "",
    ebsVolumeId: "",
    ebsVolumeType: "",
    ec2InstanceId: "",
    filesystem: "",
    handle: "",
    host: "",
    size: 0,
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
    containerMemoryLimitMb: 0,
    currentReleaseId: "",
    instanceClass: "m5",
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
    drainType: "",
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
    containerCount: 0,
    containerSize: 0,
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
    instanceProfile: "",
    userName: "unknown",
    userEmail: "",
    env: "",
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
    availablePlans: ["starter", "growth", "scale"],
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
  return {
    id: "",
    daily: 0,
    monthly: 0,
    yearly: 0,
    makeCopy: false,
    keepFinal: false,
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
    selectedOrganizationId: "",
    ...u,
  };
};

export const defaultBillingDetail = (
  bt: Partial<BillingDetail> = {},
): BillingDetail => {
  return {
    id: "",
    paymentMethodUrl: "",
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
    modifiedEnvKeys: [],
    dockerTag: "",
    dockerSha: "",
    gitHead: "",
    gitSha: "",
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
