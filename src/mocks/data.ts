import {
  defaultAppResponse,
  defaultDatabaseImageResponse,
  defaultEndpointResponse,
  defaultEnvResponse,
  defaultOperationResponse,
  defaultServiceResponse,
  defaultStackResponse,
} from "@app/deploy";
import { defaultCodeScanResponse } from "@app/deploy/code-scan-result";
import { createEnv } from "@app/env";
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

const testUserId = createId();

export const testToken = defaultTokenResponse({
  access_token: `${createId()}`,
  id: `${createId()}`,
  _links: {
    self: { href: "" },
    user: { href: `${testEnv.authUrl}/users/${testUserId}` },
    actor: null,
  },
});

export const testUser = defaultUserResponse({ id: testUserId });
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
