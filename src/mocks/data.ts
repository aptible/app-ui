import {
  defaultActivePlanResponse,
  defaultAppResponse,
  defaultConfigurationResponse,
  defaultDatabaseImageResponse,
  defaultEndpointResponse,
  defaultEnvResponse,
  defaultOperationResponse,
  defaultPlanResponse,
  defaultServiceResponse,
  defaultStackResponse,
} from "@app/deploy";
import { defaultCodeScanResponse } from "@app/deploy/code-scan-result";
import { createEnv } from "@app/env";
import { defaultHalHref } from "@app/hal";
import { defaultOrgResponse } from "@app/organizations";
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

export const testEnv = createEnv({
  origin: "app",
  authUrl: "https://auth.aptible.com",
  apiUrl: "https://api.aptible.com",
  billingUrl: "https://billing.aptible.com",
  legacyDashboardUrl: "https://dashboard.aptible.com",
});

export const mockJwtHeaders = btoa(
  JSON.stringify({ alg: "HS256", typ: "JWT" }),
);
const mockJwtPayload = btoa(
  JSON.stringify({ someBackendData: `${testEnv.authUrl}/data` }),
);
export const mockJwt = (mixin: string, id: string | number = "1") =>
  `${mockJwtHeaders}.${mockJwtPayload}.not_real_${mixin}_${id}`;

export const testUserId = createId();

export const testToken = defaultTokenResponse({
  access_token: `${mockJwt(createId().toString())}`,
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
  email: testEmail,
});
export const testSshKey = defaultSshKeyResponse({ id: `${createId()}` });

export const testOrg = defaultOrgResponse({
  name: createText("org"),
  id: `${createId()}`,
});
export const testStack = defaultStackResponse({
  id: createId(),
  name: createText("stack"),
  region: "us-east-1",
});

export const testAccount = defaultEnvResponse({
  id: createId(),
  handle: createText("account"),
  _links: {
    stack: { href: `${testEnv.apiUrl}/stacks/${testStack.id}` },
    environment: { href: "" },
  },
});

export const testDatabaseId = createId();

export const testServiceRails = defaultServiceResponse({
  id: createId(),
  handle: createText("web"),
  command: "rails s",
});
export const testServiceSidekiq = defaultServiceResponse({
  id: createId(),
  handle: createText("background"),
  command: "rake sidekiq",
});

export const testApp = defaultAppResponse({
  id: createId(),
  handle: createText("app"),
  _links: {
    account: { href: `${testEnv.apiUrl}/accounts/${testAccount.id}` },
    current_configuration: { href: "" },
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
    code_scan_result: {
      href: `${testEnv.apiUrl}/code_scan_results/${createId()}`,
    },
    resource: { href: `${testEnv.apiUrl}/apps/${testApp.id}` },
    ephemeral_sessions: { href: "" },
    self: { href: "" },
    account: testApp._links.account,
    ssh_portal_connections: { href: "" },
    user: { href: "" },
    logs: { href: "" },
  },
});

export const testCodeScanResult = defaultCodeScanResponse({
  id: createId(),
  dockerfile_present: true,
  _links: {
    app: { href: `${testEnv.apiUrl}/apps/${testApp.id}` },
    operation: { href: "" },
  },
});

export const testPostgresDatabaseImage = defaultDatabaseImageResponse({
  id: createId(),
  type: "postgres",
  version: "14",
});

export const testRedisDatabaseImage = defaultDatabaseImageResponse({
  id: createId(),
  type: "redis",
  version: "5",
});

export const testDatabaseOp = defaultOperationResponse({
  id: createId(),
  type: "provision",
  status: "succeeded",
  _links: {
    resource: {
      href: `${testEnv.apiUrl}/databases/${testDatabaseId}`,
    },
    account: { href: `${testEnv.apiUrl}/accounts/${testAccount.id}` },
    code_scan_result: { href: "" },
    self: { href: "" },
    ssh_portal_connections: { href: "" },
    ephemeral_sessions: { href: "" },
    logs: { href: "" },
    user: { href: "" },
  },
});

export const testEndpoint = defaultEndpointResponse({
  id: createId(),
  _links: {
    service: { href: `${testEnv.apiUrl}/services/${testServiceRails.id}` },
    certificate: { href: "" },
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
  available_plans: ["growth", "scale"],
  organization_id: testOrg.id,
  _links: {
    organization: defaultHalHref(
      `${testEnv.authUrl}/organizations/${testOrg.id}`,
    ),
    plan: defaultHalHref(`${testEnv.apiUrl}/plans/${testPlan.id}`),
  },
});

export const testConfiguration = defaultConfigurationResponse({
  id: createId(),
  _links: {
    resource: defaultHalHref(`${testEnv.apiUrl}/apps/${testApp.id}`),
  },
});

export const testEnvExpress = defaultEnvResponse({
  id: createId(),
  handle: createText("express"),
  onboarding_status: "initiated",
  _links: {
    stack: defaultHalHref(`${testEnv.apiUrl}/stacks/${testStack.id}`),
    environment: defaultHalHref(),
  },
});
export const testAppDeployedId = createId();
export const testAppDeployed = defaultAppResponse({
  id: testAppDeployedId,
  handle: `${testEnvExpress.handle}-app`,
  _links: {
    account: defaultHalHref(`${testEnv.apiUrl}/accounts/${testEnvExpress.id}`),
    current_configuration: defaultHalHref(),
  },
  _embedded: {
    services: [],
    current_image: null,
    last_operation: null,
    last_deploy_operation: defaultOperationResponse({
      id: createId(),
      type: "deploy",
      status: "succeeded",
      updated_at: new Date("2023-04-08T14:00:00.0000").toISOString(),
      _links: {
        resource: defaultHalHref(`${testEnv.apiUrl}/apps/${testAppDeployedId}`),
        account: defaultHalHref(
          `${testEnv.apiUrl}/accounts/${testEnvExpress.id}`,
        ),
        code_scan_result: defaultHalHref(),
        ephemeral_sessions: defaultHalHref(),
        logs: defaultHalHref(),
        ssh_portal_connections: defaultHalHref(),
        self: defaultHalHref(),
        user: defaultHalHref(),
      },
    }),
  },
});
