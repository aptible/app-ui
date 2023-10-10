import {
  DeployAppResponse,
  DeployDatabaseResponse,
  DeployEndpointResponse,
  DeployEnvironmentResponse,
  DeployMetricDrainResponse,
  DeployServiceResponse,
  DeployStackResponse,
  defaultCertificateResponse,
  defaultDatabaseResponse,
  defaultLogDrainResponse,
  defaultMetricDrainResponse,
  defaultOperationResponse,
} from "@app/deploy";
import { defaultHalHref } from "@app/hal";
import { RoleResponse } from "@app/roles";
import { UserResponse } from "@app/users";
import { rest } from "msw";
import {
  createId,
  testAccount,
  testActivePlan,
  testApp,
  testBackupRp,
  testBillingDetail,
  testCodeScanResult,
  testConfiguration,
  testDatabaseId,
  testDatabaseOp,
  testDisk,
  testEndpoint,
  testEnterprisePlan,
  testEnv,
  testOperations,
  testOrg,
  testOrgReauth,
  testPlan,
  testPostgresDatabaseImage,
  testRedisDatabaseImage,
  testRole,
  testScanOperation,
  testSshKey,
  testStack,
  testToken,
  testUser,
  testUserVerified,
} from "./data";

const authHandlers = [
  rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
    return res(ctx.json(testToken));
  }),
  rest.get(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { organizations: [testOrg] } }));
  }),
  rest.get(`${testEnv.authUrl}/reauthenticate_organizations`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { organizations: [testOrgReauth] } }));
  }),

  rest.get(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
    return res(ctx.json(testUser));
  }),
  rest.put(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
    return res(ctx.json(testUser));
  }),
  rest.post(`${testEnv.authUrl}/users`, (_, res, ctx) => {
    return res(ctx.json(testUser));
  }),
  rest.post(`${testEnv.authUrl}/organizations`, (_, res, ctx) => {
    return res(ctx.json(testOrg));
  }),
  rest.get(`${testEnv.authUrl}/organizations/:orgId/users`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { users: [testUser] } }));
  }),
  rest.get(`${testEnv.authUrl}/organizations/:orgId/roles`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { roles: [testRole] } }));
  }),
  rest.get(`${testEnv.authUrl}/users/:userId/roles`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { roles: [testRole] } }));
  }),
  rest.get(`${testEnv.authUrl}/users/:userId/ssh_keys`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { ssh_keys: [testSshKey] } }));
  }),
  rest.post(
    `${testEnv.authUrl}/users/:userId/email_verification_challenges`,
    (_, res, ctx) => {
      return res(ctx.status(204));
    },
  ),
  rest.post(`${testEnv.authUrl}/password/resets/new`, (_, res, ctx) => {
    return res(ctx.status(204));
  }),
  rest.post(`${testEnv.authUrl}/verifications`, (_, res, ctx) => {
    return res(ctx.status(204));
  }),
  rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
    return res(ctx.json(testToken));
  }),
  rest.delete(`${testEnv.authUrl}/tokens/:id`, (_, res, ctx) => {
    return res(ctx.status(204));
  }),
];

export const verifiedUserHandlers = (
  {
    user = testUserVerified,
    role = testRole,
  }: { user?: UserResponse; role?: RoleResponse } = {
    user: testUserVerified,
    role: testRole,
  },
) => {
  return [
    rest.get(`${testEnv.authUrl}/organizations/:orgId/users`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: [user] }));
    }),
    rest.get(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
      return res(ctx.json(user));
    }),
    rest.put(`${testEnv.authUrl}/users/:userId`, (_, res, ctx) => {
      return res(ctx.json(user));
    }),
    rest.get(`${testEnv.authUrl}/organizations/:orgId/roles`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { roles: [role] } }));
    }),
    rest.get(`${testEnv.authUrl}/users/:userId/roles`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { roles: [role] } }));
    }),
  ];
};

export const stacksWithResources = (
  {
    stacks = [testStack],
    accounts = [],
    apps = [],
    databases = [],
    services = [],
    vhosts = [],
    metric_drains = [],
    log_drains = [],
  }: {
    stacks?: DeployStackResponse[];
    accounts?: DeployEnvironmentResponse[];
    apps?: DeployAppResponse[];
    databases?: DeployDatabaseResponse[];
    services?: DeployServiceResponse[];
    vhosts?: DeployEndpointResponse[];
    metric_drains?: DeployMetricDrainResponse[];
    log_drains?: any[];
  } = {
    stacks: [testStack],
    accounts: [],
    apps: [],
    databases: [],
    services: [],
    vhosts: [],
    metric_drains: [],
    log_drains: [],
  },
) => {
  return [
    rest.get(`${testEnv.apiUrl}/stacks`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { stacks } }));
    }),
    rest.get(`${testEnv.apiUrl}/accounts`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { accounts } }));
    }),
    rest.get(`${testEnv.apiUrl}/accounts/:id`, (_, res, ctx) => {
      return res(ctx.json(testAccount));
    }),
    rest.get(`${testEnv.apiUrl}/apps`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { apps } }));
    }),
    rest.get(`${testEnv.apiUrl}/apps/:id`, (req, res, ctx) => {
      return res(ctx.json(apps.find((app) => `${app.id}` === req.params.id)));
    }),
    rest.get(`${testEnv.apiUrl}/databases`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { databases } }));
    }),
    rest.get(`${testEnv.apiUrl}/databases/:id`, (req, res, ctx) => {
      return res(
        ctx.json(
          databases.find((database) => `${database.id}` === req.params.id),
        ),
      );
    }),
    rest.get(`${testEnv.apiUrl}/accounts/:envId/databases`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { databases } }));
    }),
    rest.get(`${testEnv.apiUrl}/vhosts`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { vhosts } }));
    }),
    rest.get(`${testEnv.apiUrl}/metric_drains`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { metric_drains } }));
    }),
    rest.get(`${testEnv.apiUrl}/log_drains`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { log_drains } }));
    }),
    rest.get(`${testEnv.apiUrl}/services`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { services } }));
    }),
    rest.get(`${testEnv.apiUrl}/apps/:id/services`, (_, res, ctx) => {
      return res(ctx.json({ _embedded: { services } }));
    }),
    rest.get(`${testEnv.apiUrl}/services/:id`, (req, res, ctx) => {
      return res(
        ctx.json(services.find((service) => `${service.id}` === req.params.id)),
      );
    }),
    rest.get(`${testEnv.apiUrl}/databases/:id/operations`, (_, res, ctx) => {
      return res(
        ctx.json({
          _embedded: { operations: testOperations },
        }),
      );
    }),
    rest.get(`${testEnv.apiUrl}/operations/:id/logs`, (_, res, ctx) => {
      return res(ctx.text(`${testEnv.apiUrl}/mock`));
    }),
    rest.get(`${testEnv.apiUrl}/mock`, (_, res, ctx) => {
      // this is to mimick any possible external calls (ex: s3)
      // meant to be consumed by above call
      return res(ctx.text("complete"));
    }),
  ];
};

const apiHandlers = [
  ...stacksWithResources(),
  rest.post(
    `${testEnv.apiUrl}/databases/:id/operations`,
    async (_, res, ctx) => {
      return res(ctx.json(testDatabaseOp));
    },
  ),
  rest.get(`${testEnv.apiUrl}/apps/:id/operations`, (_, res, ctx) => {
    return res(
      ctx.json({
        _embedded: { operations: [testScanOperation] },
      }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/organizations/:id/operations`, (_, res, ctx) => {
    return res(
      ctx.json({
        _embedded: { operations: [] },
      }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/operations/:id`, (req, res, ctx) => {
    const op = testOperations.find((op) => `${op.id}` === req.params.id);
    if (!op) {
      return res(
        ctx.json(
          defaultOperationResponse({
            id: parseInt(req.params.id as string),
            status: "succeeded",
            _links: {
              resource: { href: `${testEnv.apiUrl}/apps/${req.params.id}` },
              account: testApp._links.account,
              code_scan_result: { href: "" },
              self: { href: "" },
              ssh_portal_connections: { href: "" },
              ephemeral_sessions: { href: "" },
              logs: { href: "" },
              user: { href: "" },
            },
          }),
        ),
      );
    }
    return res(ctx.json(op));
  }),
  rest.post(`${testEnv.apiUrl}/apps/:id/operations`, async (req, res, ctx) => {
    const data = await req.json();
    return res(
      ctx.json(
        defaultOperationResponse({
          id: createId(),
          type: data.type,
          env: data.env,
          status: "succeeded",
          _links: {
            resource: { href: `${testEnv.apiUrl}/apps/${req.params.id}` },
            account: testApp._links.account,
            code_scan_result: { href: "" },
            self: { href: "" },
            ssh_portal_connections: { href: "" },
            ephemeral_sessions: { href: "" },
            logs: { href: "" },
            user: { href: "" },
          },
        }),
      ),
    );
  }),
  rest.get(`${testEnv.apiUrl}/services/:id/operations`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { operations: [] } }));
  }),
  rest.post(
    `${testEnv.apiUrl}/services/:id/operations`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(
        ctx.json(
          defaultOperationResponse({
            id: createId(),
            type: data.type,
            env: data.env,
            status: "succeeded",
            _links: {
              resource: { href: `${testEnv.apiUrl}/services/${req.params.id}` },
              account: testApp._links.account,
              code_scan_result: { href: "" },
              self: { href: "" },
              ssh_portal_connections: { href: "" },
              ephemeral_sessions: { href: "" },
              logs: { href: "" },
              user: { href: "" },
            },
          }),
        ),
      );
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/databases/:id/operations`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(
        ctx.json(
          defaultOperationResponse({
            id: createId(),
            type: data.type,
            env: data.env,
            status: "succeeded",
            _links: {
              resource: {
                href: `${testEnv.apiUrl}/databases/${req.params.id}`,
              },
              account: testApp._links.account,
              code_scan_result: { href: "" },
              self: { href: "" },
              ssh_portal_connections: { href: "" },
              ephemeral_sessions: { href: "" },
              logs: { href: "" },
              user: { href: "" },
            },
          }),
        ),
      );
    },
  ),
  rest.delete(`${testEnv.apiUrl}/accounts/:id`, async (_, res, ctx) => {
    return res(ctx.status(204));
  }),
  rest.get(`${testEnv.apiUrl}/apps/:id/vhosts`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { vhosts: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/accounts/:id/vhosts`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { vhosts: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/apps/:id/service_definitions`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { service_definitions: [] } }));
  }),
  rest.post(`${testEnv.apiUrl}/accounts`, (_, res, ctx) => {
    return res(ctx.json(testAccount));
  }),
  rest.patch(`${testEnv.apiUrl}/accounts/:id`, (req, res, ctx) => {
    return res(
      ctx.json({
        ...testAccount,
        onboarding_status: req.headers.get("onboarding_status"),
      }),
    );
  }),
  rest.post(
    `${testEnv.apiUrl}/accounts/:envId/databases`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(
        ctx.json(
          defaultDatabaseResponse({
            id: testDatabaseId,
            handle: data.handle,
            type: data.type,
            _links: {
              account: {
                href: `${testEnv.apiUrl}/accounts/${data.account_id}`,
              },
              initialize_from: { href: "" },
              database_image: {
                href: `${testEnv.apiUrl}/database_images/${data.database_image_id}`,
              },
              service: { href: "" },
              disk: { href: "" },
            },
          }),
        ),
      );
    },
  ),
  rest.get(`${testEnv.apiUrl}/accounts/:envId/operations`, (_, res, ctx) => {
    return res(
      ctx.json({
        _embedded: { operations: [testScanOperation, testDatabaseOp] },
      }),
    );
  }),
  rest.post(`${testEnv.apiUrl}/accounts/:envId/apps`, async (req, res, ctx) => {
    const data = await req.json();
    return res(
      ctx.json({
        ...testApp,
        handle: data.handle,
        _links: {
          account: { href: `${testEnv.apiUrl}/accounts/${data.account_id}` },
          current_configuration: defaultHalHref(
            `${testEnv.apiUrl}/configurations/${testConfiguration.id}`,
          ),
        },
      }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/configurations/:id`, (_, res, ctx) => {
    return res(ctx.json(testConfiguration));
  }),
  rest.get(`${testEnv.apiUrl}/code_scan_results/:id`, (_, res, ctx) => {
    return res(ctx.json(testCodeScanResult));
  }),
  rest.get(`${testEnv.apiUrl}/database_images`, (_, res, ctx) => {
    return res(
      ctx.json({
        _embedded: {
          database_images: [testRedisDatabaseImage, testPostgresDatabaseImage],
        },
      }),
    );
  }),
  rest.post(`${testEnv.apiUrl}/services/:id/vhosts`, async (_, res, ctx) => {
    return res(ctx.json(testEndpoint));
  }),
  rest.patch(`${testEnv.apiUrl}/vhosts/:id`, async (req, res, ctx) => {
    const data = await req.json();
    return res(
      ctx.json({
        ...testEndpoint,
        container_port: data.container_port,
        ip_whitelist: data.ip_whitelist,
      }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/vhosts/:id/operations`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { operations: [] } }));
  }),
  rest.post(`${testEnv.apiUrl}/vhosts/:id/operations`, async (_, res, ctx) => {
    return res(
      ctx.json(
        defaultOperationResponse({
          id: createId(),
          type: "provision",
          status: "succeeded",
          _links: {
            resource: { href: `${testEnv.apiUrl}/vhosts/${testEndpoint.id}` },
            account: testApp._links.account,
            code_scan_result: { href: "" },
            self: { href: "" },
            ssh_portal_connections: { href: "" },
            ephemeral_sessions: { href: "" },
            logs: { href: "" },
            user: { href: "" },
          },
        }),
      ),
    );
  }),
  rest.get(`${testEnv.apiUrl}/active_plans`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { active_plans: [testActivePlan] } }));
  }),
  rest.put(`${testEnv.apiUrl}/active_plans/:id`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { active_plan: testActivePlan } }));
  }),
  rest.get(`${testEnv.apiUrl}/plans*`, async (_, res, ctx) => {
    return res(
      ctx.json({ _embedded: { plans: [testPlan, testEnterprisePlan] } }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/plans/:id`, async (_, res, ctx) => {
    return res(ctx.json({ ...testPlan }));
  }),
  rest.get(`${testEnv.apiUrl}/vhosts/:id`, (_, res, ctx) => {
    return res(ctx.json(testEndpoint));
  }),
  rest.get(`${testEnv.apiUrl}/vhosts`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { vhosts: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/services`, (_, res, ctx) => {
    return res(ctx.json({ _embedded: { services: [] } }));
  }),
  rest.get(
    `${testEnv.apiUrl}/accounts/:id/certificates`,
    async (_, res, ctx) => {
      return res(ctx.json({ _embedded: { certificates: [] } }));
    },
  ),
  rest.get(`${testEnv.apiUrl}/certificates/:id`, async (_, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post(
    `${testEnv.apiUrl}/accounts/:id/certificates`,
    async (_, res, ctx) => {
      return res(ctx.json(defaultCertificateResponse({ id: createId() })));
    },
  ),
  rest.get(`${testEnv.apiUrl}/accounts/:id/backups`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { backups: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/log_drains`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { log_drains: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/accounts/:id/log_drains`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { log_drains: [] } }));
  }),
  rest.get(`${testEnv.apiUrl}/metric_drains`, async (_, res, ctx) => {
    return res(ctx.json({ _embedded: { metric_drains: [] } }));
  }),
  rest.get(
    `${testEnv.apiUrl}/accounts/:id/metric_drains`,
    async (_, res, ctx) => {
      return res(ctx.json({ _embedded: { metric_drains: [] } }));
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/accounts/:id/metric_drains`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(
        ctx.json(
          defaultMetricDrainResponse({
            id: `${createId()}`,
            _links: {
              account: defaultHalHref(
                `${testEnv.apiUrl}/accounts/${req.params.id}`,
              ),
            },
            ...data,
          }),
        ),
      );
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/metric_drains/:id/operations`,
    async (_, res, ctx) => {
      return res(
        ctx.json(
          defaultOperationResponse({
            id: createId(),
          }),
        ),
      );
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/accounts/:id/log_drains`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(
        ctx.json(
          defaultLogDrainResponse({
            id: `${createId()}`,
            _links: {
              account: defaultHalHref(
                `${testEnv.apiUrl}/accounts/${req.params.id}`,
              ),
            },
            ...data,
          }),
        ),
      );
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/log_drains/:id/operations`,
    async (_, res, ctx) => {
      return res(
        ctx.json(
          defaultOperationResponse({
            id: createId(),
          }),
        ),
      );
    },
  ),
  rest.get(
    `${testEnv.apiUrl}/accounts/:id/backup_retention_policies`,
    async (_, res, ctx) => {
      return res(
        ctx.json({ _embedded: { backup_retention_policies: [testBackupRp] } }),
      );
    },
  ),
  rest.post(
    `${testEnv.apiUrl}/accounts/:id/backup_retention_policies`,
    async (req, res, ctx) => {
      const data = await req.json();
      return res(ctx.json({ ...testBackupRp, ...data }));
    },
  ),
  rest.get(`${testEnv.apiUrl}/disks/:id`, async (_, res, ctx) => {
    return res(ctx.json(testDisk));
  }),
];

const billingHandlers = [
  rest.get(`${testEnv.billingUrl}/billing_details/:id`, async (_, res, ctx) => {
    return res(ctx.json(testBillingDetail));
  }),
  rest.get(
    `${testEnv.billingUrl}/billing_details/:id/trials`,
    async (_, res, ctx) => {
      return res(ctx.json({ _embedded: { trials: [] } }));
    },
  ),
  rest.get(
    `${testEnv.billingUrl}/billing_details/:id/stripe_sources`,
    async (_, res, ctx) => {
      return res(ctx.json({ _embedded: { stripe_sources: [] } }));
    },
  ),
  rest.post(`${testEnv.billingUrl}/billing_details`, async (_, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post(
    `${testEnv.billingUrl}/billing_details/:id/billing_cycles`,
    async (_, res, ctx) => {
      return res(ctx.json({}));
    },
  ),
  rest.post(
    `${testEnv.billingUrl}/billing_details/:id/billing_contacts`,
    async (_, res, ctx) => {
      return res(ctx.json({}));
    },
  ),
];

export const handlers = [...authHandlers, ...apiHandlers, ...billingHandlers];
