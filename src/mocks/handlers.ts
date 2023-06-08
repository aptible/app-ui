import {
  createId,
  testAccount,
  testActivePlan,
  testApp,
  testCodeScanResult,
  testConfiguration,
  testDatabaseId,
  testDatabaseOp,
  testEndpoint,
  testEnterprisePlan,
  testEnv,
  testOrg,
  testPlan,
  testPostgresDatabaseImage,
  testRedisDatabaseImage,
  testScanOperation,
  testSshKey,
  testStack,
  testToken,
  testUser,
} from "./data";
import {
  DeployAppResponse,
  DeployDatabaseResponse,
  DeployEnvironmentResponse,
  DeployStackResponse,
  defaultDatabaseResponse,
  defaultOperationResponse,
} from "@app/deploy";
import { RestRequest, rest } from "msw";

const isValidToken = (req: RestRequest) => {
  const authorization = req.headers.get("authorization");
  return `Bearer ${testToken.access_token}` === authorization;
};

const authHandlers = [
  rest.get(`${testEnv.authUrl}/current_token`, (_, res, ctx) => {
    return res(ctx.json(testToken));
  }),
  rest.get(`${testEnv.authUrl}/organizations`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json({ _embedded: { organizations: [testOrg] } }));
  }),

  rest.get(`${testEnv.authUrl}/users/:userId`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json(testUser));
  }),
  rest.post(`${testEnv.authUrl}/users`, (req, res, ctx) => {
    return res(ctx.json(testUser));
  }),
  rest.post(`${testEnv.authUrl}/organizations`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json(testOrg));
  }),
  rest.get(`${testEnv.authUrl}/organizations/:orgId/users`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json({ _embedded: { users: [testUser] } }));
  }),
  rest.get(`${testEnv.authUrl}/users/:userId/ssh_keys`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json({ _embedded: { ssh_keys: [testSshKey] } }));
  }),
  rest.post(
    `${testEnv.authUrl}/users/:userId/email_verification_challenges`,
    (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }

      return res(ctx.status(204));
    },
  ),
  rest.post(`${testEnv.authUrl}/password/resets/new`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.status(204));
  }),
  rest.post(`${testEnv.authUrl}/verifications`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.status(200));
  }),
  rest.post(`${testEnv.authUrl}/tokens`, (_, res, ctx) => {
    return res(ctx.json(testToken));
  }),
];

export const stacksWithResources = (
  {
    stacks = [testStack],
    accounts = [],
    apps = [],
    databases = [],
  }: {
    stacks?: DeployStackResponse[];
    accounts?: DeployEnvironmentResponse[];
    apps?: DeployAppResponse[];
    databases?: DeployDatabaseResponse[];
  } = { stacks: [testStack], accounts: [], apps: [], databases: [] },
) => {
  return [
    rest.get(`${testEnv.apiUrl}/stacks`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json({ _embedded: { stacks } }));
    }),
    rest.get(`${testEnv.apiUrl}/accounts`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json({ _embedded: { accounts } }));
    }),
    rest.get(`${testEnv.apiUrl}/apps`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json({ _embedded: { apps } }));
    }),
    rest.get(`${testEnv.apiUrl}/apps/:id`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json(apps.find((app) => `${app.id}` === req.params.id)));
    }),
    rest.get(`${testEnv.apiUrl}/databases`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json({ _embedded: { databases } }));
    }),
    rest.get(`${testEnv.apiUrl}/accounts/:envId/databases`, (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }

      return res(ctx.json({ _embedded: { databases } }));
    }),
  ];
};

const apiHandlers = [
  ...stacksWithResources(),
  rest.post(
    `${testEnv.apiUrl}/databases/:id/operations`,
    async (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json(testDatabaseOp));
    },
  ),
  rest.get(`${testEnv.apiUrl}/apps/:id/operations`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(
      ctx.json({
        _embedded: { operations: [testScanOperation] },
      }),
    );
  }),
  rest.post(`${testEnv.apiUrl}/apps/:id/operations`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
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
  rest.get(`${testEnv.apiUrl}/apps/:id/vhosts`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json({ _embedded: { vhosts: [] } }));
  }),
  rest.get(
    `${testEnv.apiUrl}/apps/:id/service_definitions`,
    (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }
      return res(ctx.json({ _embedded: { service_definitions: [] } }));
    },
  ),
  rest.post(`${testEnv.apiUrl}/accounts`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json(testAccount));
  }),
  rest.get(`${testEnv.apiUrl}/accounts/:id`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json(testAccount));
  }),
  rest.patch(`${testEnv.apiUrl}/accounts/:id`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

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
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }

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
            },
          }),
        ),
      );
    },
  ),
  rest.get(`${testEnv.apiUrl}/accounts/:envId/operations`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(
      ctx.json({
        _embedded: { databases: [testScanOperation, testDatabaseOp] },
      }),
    );
  }),
  rest.post(`${testEnv.apiUrl}/accounts/:envId/apps`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    const data = await req.json();
    return res(
      ctx.json({
        ...testApp,
        handle: data.handle,
        _links: {
          account: { href: `${testEnv.apiUrl}/accounts/${data.account_id}` },
          current_configuration: { href: "" },
        },
      }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/configurations/:id`, (_, res, ctx) => {
    return res(ctx.json(testConfiguration));
  }),
  rest.get(`${testEnv.apiUrl}/code_scan_results/:id`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json(testCodeScanResult));
  }),
  rest.get(`${testEnv.apiUrl}/database_images`, (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(
      ctx.json({
        _embedded: {
          database_images: [testRedisDatabaseImage, testPostgresDatabaseImage],
        },
      }),
    );
  }),
  rest.post(`${testEnv.apiUrl}/services/:id/vhosts`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json(testEndpoint));
  }),
  rest.post(
    `${testEnv.apiUrl}/vhosts/:id/operations`,
    async (req, res, ctx) => {
      if (!isValidToken(req)) {
        return res(ctx.status(401));
      }

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
    },
  ),
  rest.get(`${testEnv.apiUrl}/active_plans`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json({ _embedded: { active_plans: [testActivePlan] } }));
  }),
  rest.put(`${testEnv.apiUrl}/active_plans/:id`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }
    return res(ctx.json({ _embedded: { active_plan: testActivePlan } }));
  }),
  rest.get(`${testEnv.apiUrl}/plans*`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(
      ctx.json({ _embedded: { plans: [testPlan, testEnterprisePlan] } }),
    );
  }),
  rest.get(`${testEnv.apiUrl}/plans/:id`, async (req, res, ctx) => {
    if (!isValidToken(req)) {
      return res(ctx.status(401));
    }

    return res(ctx.json({ ...testPlan }));
  }),
];

export const handlers = [...authHandlers, ...apiHandlers];
