import {
  defaultMembershipResponse,
  defaultSamlConfigurationResponse,
  defaultScimConfigurationResponse,
} from "@app/auth";
import { defaultBillingDetailResponse } from "@app/billing";
import {
  defaultActivePlanResponse,
  defaultAppResponse,
  defaultBackupRpResponse,
  defaultConfigurationResponse,
  defaultDatabaseImageResponse,
  defaultDatabaseResponse,
  defaultDeployDiskResponse,
  defaultEndpointResponse,
  defaultEnvResponse,
  defaultOperationResponse,
  defaultPermissionResponse,
  defaultPlanResponse,
  defaultServiceResponse,
  defaultServiceSizingPolicyResponse,
  defaultStackResponse,
} from "@app/deploy";
import { defaultCodeScanResponse } from "@app/deploy/code-scan-result";
import { defaultDeploymentResponse } from "@app/deployment";
import { defaultHalHref } from "@app/hal";
import { defaultInvitationResponse } from "@app/invitations";
import { defaultOrgResponse } from "@app/organizations";
import { defaultRoleResponse } from "@app/roles";
import { defaultConfig } from "@app/schema";
import { defaultSshKeyResponse } from "@app/ssh-keys";
import { defaultTokenResponse } from "@app/token";
import { defaultUserResponse } from "@app/users";

const idFactory = () => {
  let id = 1;
  return () => {
    id += 1;
    return id;
  };
};
export const createId = idFactory();
export const createText = (mixin: string, id: string | number = "1") => {
  return `test-${mixin}-${id}`;
};

export const testEnv = defaultConfig({
  isTest: true,
  origin: "app",
  authUrl: "https://auth.aptible-test.com",
  apiUrl: "https://api.aptible-test.com",
  billingUrl: "https://billing.aptible-test.com",
  legacyDashboardUrl: "https://dashboard.aptible-test.com",
  metricTunnelUrl: "https://metrictunnel.aptible-test.com",
  portalUrl: "https://portal.aptible-test.com",
  aptibleAiUrl: "wss://ai.aptible-test.com",
});

export const testUserId = createId();
export const mockJwtHeaders = btoa(
  JSON.stringify({ alg: "HS256", typ: "JWT" }),
);
const mockJwtPayload = (scope: string) =>
  btoa(JSON.stringify({ id: `${testUserId}`, scope }));
export const mockJwt = (mixin: string, scope: string) =>
  `${mockJwtHeaders}.${mockJwtPayload(scope)}.not_real_${mixin}`;

export const testToken = defaultTokenResponse({
  access_token: `${mockJwt(createId().toString(), "manage")}`,
  id: `${createId()}`,
  _links: {
    self: defaultHalHref(),
    user: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
    actor: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
  },
});

export const testElevatedToken = defaultTokenResponse({
  access_token: `${mockJwt(createId().toString(), "elevated")}`,
  scope: "elevated",
  id: `${createId()}`,
  _links: {
    self: defaultHalHref(),
    user: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
    actor: defaultHalHref(`${testEnv.authUrl}/users/${testUserId}`),
  },
});

export const testEmail = "test@aptible.com";
export const testUser = defaultUserResponse({
  id: testUserId,
  name: "not-verified",
  email: testEmail,
  verified: false,
});
export const testUserNotVerified = defaultUserResponse({
  id: testUserId,
  name: "not-verified",
  email: testEmail,
  verified: false,
});
export const testUserVerified = defaultUserResponse({
  id: testUserId,
  name: "verified",
  email: "test.verified@aptible.com",
  verified: true,
});
export const testUserVerifiedSecond = defaultUserResponse({
  id: testUserId,
  name: "verified-2",
  email: "test.verified.2@aptible.com",
  verified: true,
});
export const testUserExtra = defaultUserResponse({
  id: createId(),
  name: "extra-1",
  email: "test.extra.1@aptible.com",
  verified: true,
});

export const testSshKey = defaultSshKeyResponse({ id: `${createId()}` });

export const testBillingDetail = defaultBillingDetailResponse({
  id: `${createId()}`,
  _links: {
    payment_method: defaultHalHref(
      `${testEnv.billingUrl}/external_payment_sources/404`,
    ),
  },
});

export const testOrg = defaultOrgResponse({
  name: createText("org"),
  id: `${createId()}`,
  _links: {
    billing_detail: defaultHalHref(
      `${testEnv.billingUrl}/billing_details/${testBillingDetail.id}`,
    ),
    self: defaultHalHref(),
    invitations: defaultHalHref(),
    roles: defaultHalHref(),
    security_officer: defaultHalHref(),
    users: defaultHalHref(),
  },
});
export const testOrgSpecial = defaultOrgResponse({
  id: `${createId()}`,
  name: "Wow Org",
  updated_at: new Date("2023-01-01").toISOString(),
});
export const testOrgReauth = defaultOrgResponse({
  id: `${createId()}`,
  name: "Reauth Org",
  updated_at: new Date("2023-01-01").toISOString(),
  reauth_required: true,
});
export const testUserOrgSelected = defaultUserResponse({
  id: testUserId,
  email: "special@aptible.com",
  verified: true,
  _links: {
    current_otp_configuration: defaultHalHref(),
    email_verification_challenges: defaultHalHref(),
    roles: defaultHalHref(),
    self: defaultHalHref(),
    ssh_keys: defaultHalHref(),
    u2f_devices: defaultHalHref(),
    selected_organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrgSpecial.id}`,
    ),
  },
});

export const testStack = defaultStackResponse({
  id: createId(),
  name: createText("stack"),
  region: "us-east-1",
});

export const testRole = defaultRoleResponse({
  id: `${createId()}`,
  name: "Deploy User",
  type: "platform_user",
  _links: {
    organization: defaultHalHref(testOrg.id),
  },
});

export const testRoleOther = defaultRoleResponse({
  id: `${createId()}`,
  name: "Other",
  type: "platform_user",
  _links: {
    organization: defaultHalHref(testOrg.id),
  },
});

export const testUserMembership = defaultMembershipResponse({
  id: `${createId()}`,
  privileged: false,
  _links: {
    user: defaultHalHref(`${testEnv.authUrl}/users/${testUserVerified.id}`),
    role: defaultHalHref(`${testEnv.authUrl}/roles/${testRole.id}`),
  },
});

export const testUserMembershipPrivileged = defaultMembershipResponse({
  id: `${createId()}`,
  privileged: true,
  _links: {
    user: defaultHalHref(`${testEnv.authUrl}/users/${testUserVerified.id}`),
    role: defaultHalHref(`${testEnv.authUrl}/roles/${testRole.id}`),
  },
});

export const testRoleOwner = defaultRoleResponse({
  id: `${createId()}`,
  name: "Deploy Owner",
  type: "platform_owner",
  _links: {
    organization: defaultHalHref(testOrg.id),
  },
});

const testAccountId = createId();
export const testAccount = defaultEnvResponse({
  id: testAccountId,
  handle: createText("account"),
  organization_id: testOrg.id,
  _links: {
    stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
  },
  _embedded: {
    permissions: [
      defaultPermissionResponse({
        id: `${createId()}`,
        scope: "deploy",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccountId}`,
          ),
          role: defaultHalHref(`${testEnv.apiUrl}/roles/${testRole.id}`),
        },
      }),
      defaultPermissionResponse({
        id: `${createId()}`,
        scope: "destroy",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccountId}`,
          ),
          role: defaultHalHref(`${testEnv.apiUrl}/roles/${testRoleOther.id}`),
        },
      }),
    ],
  },
});

export const testAccountAdmin = defaultEnvResponse({
  id: testAccountId,
  handle: createText("account"),
  organization_id: testOrg.id,
  _links: {
    stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
  },
  _embedded: {
    permissions: [
      defaultPermissionResponse({
        id: `${createId()}`,
        scope: "admin",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccountId}`,
          ),
          role: defaultHalHref(`${testEnv.apiUrl}/roles/${testRole.id}`),
        },
      }),
    ],
  },
});

const testDestroyAccountId = createId();
export const testDestroyAccount = defaultEnvResponse({
  id: testDestroyAccountId,
  handle: createText("account-destroy"),
  organization_id: testOrg.id,
  _links: {
    stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
  },
  _embedded: {
    permissions: [
      defaultPermissionResponse({
        id: `${createId()}`,
        scope: "destroy",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testDestroyAccountId}`,
          ),
          role: defaultHalHref(`${testEnv.apiUrl}/roles/${testRole.id}`),
        },
      }),
    ],
  },
});

const testAppId = createId();

export const testServiceRails = defaultServiceResponse({
  id: createId(),
  handle: createText("web"),
  command: "rails s",
  container_count: 1,
  container_memory_limit_mb: 512,
  instance_class: "m5",
  _links: {
    current_release: defaultHalHref(),
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testAppId}`),
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccountId}`),
  },
});
export const testServiceSidekiq = defaultServiceResponse({
  id: createId(),
  handle: createText("background"),
  command: "rake sidekiq",
  container_count: 1,
  container_memory_limit_mb: 512,
  instance_class: "m5",
  _links: {
    current_release: defaultHalHref(),
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testAppId}`),
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccountId}`),
  },
});

export const testConfiguration = defaultConfigurationResponse({
  id: createId(),
  env: { DATABASE_URL: "{{test-app-1-postgres}}" },
  _links: {
    resource: defaultHalHref(`${testEnv.apiUrl}/apps/${testAppId}`),
  },
});

export const testApp = defaultAppResponse({
  id: testAppId,
  handle: createText("app"),
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
    current_configuration: defaultHalHref(),
    current_deployment: defaultHalHref(),
    current_image: defaultHalHref(),
    current_source: defaultHalHref(),
  },
  _embedded: {
    current_image: null,
    last_operation: null,
    last_deploy_operation: null,
    services: [testServiceRails, testServiceSidekiq],
  },
});

export const testScanOperation = defaultOperationResponse({
  id: createId(),
  type: "scan_code",
  status: "succeeded",
  _links: {
    code_scan_result: defaultHalHref(
      `${testEnv.apiUrl}/code_scan_results/${createId()}`,
    ),
    resource: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
    ephemeral_sessions: defaultHalHref(),
    self: defaultHalHref(),
    account: testApp._links.account,
    ssh_portal_connections: defaultHalHref(),
    user: defaultHalHref(),
    logs: defaultHalHref(),
  },
});

export const testCodeScanResult = defaultCodeScanResponse({
  id: createId(),
  dockerfile_present: true,
  _links: {
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
    operation: defaultHalHref(),
  },
});

export const testPostgresDatabaseImage = defaultDatabaseImageResponse({
  id: createId(),
  type: "postgres",
  version: "14",
  description: "postgres v14",
});

export const testRedisDatabaseImage = defaultDatabaseImageResponse({
  id: createId(),
  type: "redis",
  version: "5",
  description: "redis v5",
});

export const testDatabaseId = createId();
export const testDatabaseServiceId = createId();
export const testDatabaseOp = defaultOperationResponse({
  id: createId(),
  type: "provision",
  status: "succeeded",
  _links: {
    resource: defaultHalHref(`${testEnv.apiUrl}/databases/${testDatabaseId}`),
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
    code_scan_result: defaultHalHref(),
    self: defaultHalHref(),
    ssh_portal_connections: defaultHalHref(),
    ephemeral_sessions: defaultHalHref(),
    logs: defaultHalHref(),
    user: defaultHalHref(),
  },
});

export const testDisk = defaultDeployDiskResponse({
  id: `${createId()}`,
  size: 10,
});

export const testDatabasePostgres = defaultDatabaseResponse({
  id: testDatabaseId,
  handle: `${testApp.handle}-postgres`,
  type: "postgres",
  connection_url: "postgres://some:val@wow.com:5432",
  _embedded: {
    disk: testDisk,
    last_operation: testDatabaseOp,
  },
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
    initialize_from: defaultHalHref(),
    database_image: defaultHalHref(
      `${testEnv.apiUrl}/database_images/${testPostgresDatabaseImage.id}`,
    ),
    service: defaultHalHref(
      `${testEnv.apiUrl}/services/${testDatabaseServiceId}`,
    ),
    disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
  },
});

export const testDatabaseInfluxdb = defaultDatabaseResponse({
  id: testDatabaseId,
  handle: "influxdb-example",
  type: "influxdb",
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
    initialize_from: defaultHalHref(),
    database_image: defaultHalHref(),
    service: defaultHalHref(),
    disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
  },
});

export const testDatabaseElasticsearch = defaultDatabaseResponse({
  id: testDatabaseId,
  handle: "elasticsearch-example",
  type: "elasticsearch",
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
    initialize_from: defaultHalHref(),
    database_image: defaultHalHref(),
    service: defaultHalHref(),
    disk: defaultHalHref(`${testEnv.apiUrl}/disks/${testDisk.id}`),
  },
});

export const testServicePostgres = defaultServiceResponse({
  id: testDatabaseServiceId,
  handle: createText("postgres"),
  command: undefined,
  container_count: 1,
  container_memory_limit_mb: 512,
  process_type: "postgresql",
  _links: {
    current_release: defaultHalHref(),
    database: defaultHalHref(`${testEnv.apiUrl}/databases/${testDatabaseId}`),
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccount.id}`),
  },
});

export const testEndpoint = defaultEndpointResponse({
  id: createId(),
  _links: {
    service: defaultHalHref(
      `${testEnv.apiUrl}/services/${testServiceRails.id}`,
    ),
    certificate: defaultHalHref(),
  },
});

export const testTlsEndpoint = defaultEndpointResponse({
  id: createId(),
  type: "tls",
  _links: {
    service: defaultHalHref(
      `${testEnv.apiUrl}/services/${testServiceRails.id}`,
    ),
    certificate: defaultHalHref(),
  },
});

export const testPlan = defaultPlanResponse({
  id: createId(),
});
export const testEnterprisePlan = defaultPlanResponse({
  id: createId(),
  name: "enterprise",
});

export const testActivePlan = defaultActivePlanResponse({
  id: createId(),
  available_plans: ["development", "production"],
  organization_id: testOrg.id,
  _links: {
    organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrg.id}`,
    ),
    plan: defaultHalHref(`${testEnv.apiUrl}/plans/${testPlan.id}`),
  },
});

export const testAutoscalingActivePlan = defaultActivePlanResponse({
  id: createId(),
  organization_id: testOrg.id,
  horizontal_autoscaling: true,
  vertical_autoscaling: true,
  _links: {
    organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrg.id}`,
    ),
    plan: defaultHalHref(`${testEnv.apiUrl}/plans/${testPlan.id}`),
  },
});

export const testEnvExpress = defaultEnvResponse({
  id: createId(),
  organization_id: testOrg.id,
  handle: createText("express"),
  onboarding_status: "initiated",
  _links: {
    stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
  },
});
export const testAppDeployedId = createId();
const testAppDeployOperation = defaultOperationResponse({
  id: createId(),
  type: "deploy",
  status: "succeeded",
  updated_at: new Date("2023-04-08T14:00:00.0000").toISOString(),
  _links: {
    resource: defaultHalHref(`${testEnv.apiUrl}/apps/${testAppDeployedId}`),
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testEnvExpress.id}`),
    code_scan_result: defaultHalHref(),
    ephemeral_sessions: defaultHalHref(),
    logs: defaultHalHref(),
    ssh_portal_connections: defaultHalHref(),
    self: defaultHalHref(),
    user: defaultHalHref(),
  },
});
export const testAppDeployed = defaultAppResponse({
  id: testAppDeployedId,
  handle: `${testEnvExpress.handle}-app`,
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testEnvExpress.id}`),
    current_configuration: defaultHalHref(),
    current_deployment: defaultHalHref(),
    current_image: defaultHalHref(),
    current_source: defaultHalHref(),
  },
  _embedded: {
    services: [],
    current_image: null,
    last_operation: null,
    last_deploy_operation: testAppDeployOperation,
  },
});

export const testOperations = [
  testScanOperation,
  testDatabaseOp,
  testAppDeployOperation,
];

export const testBackupRp = defaultBackupRpResponse({
  id: createId(),
  daily: 1,
  monthly: 5,
  keep_final: true,
  make_copy: false,
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testAccountId}`),
  },
});

export const testAutoscalingStack = defaultStackResponse({
  id: createId(),
  name: createText("stack"),
  vertical_autoscaling: true,
  horizontal_autoscaling: true,
  region: "us-east-1",
});

export const testAutoscalingAccount = defaultEnvResponse({
  id: createId(),
  handle: createText("account"),
  organization_id: testOrg.id,
  _links: {
    stack: defaultHalHref(
      `${testEnv.apiUrl}/stacks/${testAutoscalingStack.id}`,
    ),
  },
  _embedded: {
    permissions: [
      defaultPermissionResponse({
        id: `${createId()}`,
        scope: "deploy",
        _links: {
          account: defaultHalHref(
            `${testEnv.apiUrl}/accounts/${testAccountId}`,
          ),
          role: defaultHalHref(`${testEnv.apiUrl}/roles/${testRole.id}`),
        },
      }),
    ],
  },
});

const testAutoscalingAppId = createId();
const testAutoscalingPolicyHASID = createId();
export const testAutoscalingService = defaultServiceResponse({
  id: createId(),
  handle: createText("web"),
  command: "rails s",
  container_count: 1,
  container_memory_limit_mb: 512,
  instance_class: "m5",
  _links: {
    current_release: defaultHalHref(),
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testAutoscalingAppId}`),
    account: defaultHalHref(
      `${testEnv.apiUrl}/accounts/${testAutoscalingAccount.id}`,
    ),
  },
});

export const testAutoscalingServiceHAS = defaultServiceResponse({
  id: createId(),
  handle: createText("web"),
  command: "rails s",
  container_count: 1,
  container_memory_limit_mb: 512,
  instance_class: "m5",
  _links: {
    current_release: defaultHalHref(),
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testAutoscalingAppId}`),
    account: defaultHalHref(
      `${testEnv.apiUrl}/accounts/${testAutoscalingAccount.id}`,
    ),
    service_sizing_policy: defaultHalHref(
      `${testEnv.apiUrl}/service_sizing_policies/${testAutoscalingPolicyHASID}`,
    ),
  },
});

export const testAutoscalingApp = defaultAppResponse({
  id: testAutoscalingAppId,
  handle: createText("app"),
  _links: {
    account: defaultHalHref(
      `${testEnv.apiUrl}/accounts/${testAutoscalingAccount.id}`,
    ),
    current_configuration: defaultHalHref(),
    current_deployment: defaultHalHref(),
    current_image: defaultHalHref(),
    current_source: defaultHalHref(),
  },
  _embedded: {
    current_image: null,
    last_operation: null,
    last_deploy_operation: null,
    services: [testAutoscalingService, testAutoscalingServiceHAS],
  },
});

export const testAutoscalingPolicy = defaultServiceSizingPolicyResponse({
  id: createId(),
});

export const testAutoscalingPolicyHAS = defaultServiceSizingPolicyResponse({
  id: testAutoscalingPolicyHASID,
  scaling_enabled: true,
  autoscaling: "horizontal",
  min_containers: 1,
  max_containers: 5,
  min_cpu_threshold: 0.2,
  max_cpu_threshold: 0.8,
  percentile: 95,
});

export const testVerifiedInvitation = defaultInvitationResponse({
  id: `${createId()}`,
  email: testUserVerified.email,
  organization_name: testOrg.name,
  inviter_name: "test.owner@aptible.com",
  role_name: testRole.name,
  _links: {
    organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrg.id}`,
    ),
  },
});

export const testSaml = defaultSamlConfigurationResponse({
  id: `${createId()}`,
  entity_id: "fake-entity-id",
  sign_in_url: "http://fake.url",
  name_format: "fake-name-format",
  _links: {
    organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrg.id}`,
    ),
  },
});

export const testScim = defaultScimConfigurationResponse({
  id: `${createId()}`,
  organization_id: `${testEnv.authUrl}/organizations/${testOrg.id}`,
  default_role_id: "",
  token_id: "",
  unique_identifier: "email",
});

const deployDate = new Date("2023-12-17T00:00:00Z").toISOString();

export const testDeploymentGit = defaultDeploymentResponse({
  id: 3,
  docker_image: "",
  git_repository_url: "https://github.com/aptible/app-ui",
  git_ref: "v3",
  git_commit_message: "fix(backup): pass page to fetch request (#754)",
  git_commit_sha: "a947a95a92e7a7a4db7fe01c28346281c128b859",
  git_commit_url:
    "https://github.com/aptible/app-ui/commit/a947a95a92e7a7a4db7fe01c28346281c128b859",
  created_at: deployDate,
  status: "pending",
  _links: {
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
    operation: defaultHalHref(
      `${testEnv.apiUrl}/operations/${testAppDeployOperation.id}`,
    ),
    configuration: defaultHalHref(),
    image: defaultHalHref(),
    source: defaultHalHref(),
  },
});

export const testDeploymentDocker = defaultDeploymentResponse({
  id: 2,
  docker_image: "quay.io/aptible/cloud-ui:v200",
  docker_repository_url: "https://quay.io/repositories/aptible/cloud-ui",
  git_repository_url: "https://github.com/aptible/app-ui",
  git_ref: "v3",
  git_commit_message: "fix(backup): pass page to fetch request (#754)",
  git_commit_sha: "a947a95a92e7a7a4db7fe01c28346281c128b859",
  git_commit_url:
    "https://github.com/aptible/app-ui/commit/a947a95a92e7a7a4db7fe01c28346281c128b859",
  status: "succeeded",
  created_at: deployDate,
  _links: {
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
    operation: defaultHalHref(
      `${testEnv.apiUrl}/operations/${testAppDeployOperation.id}`,
    ),
    configuration: defaultHalHref(),
    image: defaultHalHref(),
    source: defaultHalHref(),
  },
});

export const testDeploymentEmpty = defaultDeploymentResponse({
  id: 1,
  docker_image: "",
  git_repository_url: "",
  git_ref: "",
  git_commit_message: "",
  git_commit_sha: "",
  git_commit_url: "",
  status: "failed",
  created_at: deployDate,
  _links: {
    app: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
    operation: defaultHalHref(
      `${testEnv.apiUrl}/operations/${testAppDeployOperation.id}`,
    ),
    configuration: defaultHalHref(),
    image: defaultHalHref(),
    source: defaultHalHref(),
  },
});
