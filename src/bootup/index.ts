import { type ThunkCtx, thunks } from "@app/api";
import {
  fetchCurrentToken,
  fetchMembershipsByOrgId,
  fetchOrganizations,
} from "@app/auth";
import { fetchBillingDetail } from "@app/billing";
import {
  fetchApps,
  fetchBackups,
  fetchDatabaseImages,
  fetchDatabases,
  fetchEndpoints,
  fetchEnvironments,
  fetchLogDrains,
  fetchMetricDrains,
  fetchOperationsByOrgId,
  fetchServices,
  fetchStacks,
} from "@app/deploy";
import { fetchDeployments } from "@app/deployment";
import { call, parallel, select, takeEvery } from "@app/fx";
import { createAction } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { fetchCurrentUserRoles, fetchRoles } from "@app/roles";
import { schema } from "@app/schema";
import { fetchSources } from "@app/source";
import { fetchSystemStatus } from "@app/system-status";
import { selectAccessToken } from "@app/token";
import { fetchUser, fetchUsers, selectCurrentUserId } from "@app/users";

export const FETCH_REQUIRED_DATA = "fetch-required-data";

export const bootup = thunks.create("bootup", function* onBootup(ctx, next) {
  const id = ctx.name;
  yield* schema.update(schema.loaders.start({ id }));

  yield* call(() => fetchCurrentToken.run(fetchCurrentToken()));
  const token: string = yield* select(selectAccessToken);
  if (!token) {
    yield* schema.update([
      schema.loaders.success({
        id: FETCH_REQUIRED_DATA,
        message: "no token found",
      }),
      schema.loaders.success({
        id,
        message: "no token found",
      }),
    ]);
    return;
  }

  yield* onRefreshData();
  yield* schema.update(schema.loaders.success({ id }));
  yield* next();
});

function* onFetchRequiredData() {
  yield* schema.update(schema.loaders.start({ id: FETCH_REQUIRED_DATA }));

  const userId = yield* select(selectCurrentUserId);
  yield* fetchOrganizations.run();
  yield* fetchUser.run({ userId });
  const org = yield* select(selectOrganizationSelected);
  yield* fetchBillingDetail.run({ id: org.billingDetailId });

  yield* schema.update(schema.loaders.success({ id: FETCH_REQUIRED_DATA }));
}

function* onFetchResourceData() {
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  const group = yield* parallel<ThunkCtx>([
    fetchUsers.run({ orgId: org.id }),
    fetchRoles.run({ orgId: org.id }),
    fetchCurrentUserRoles.run({ userId: userId }),
    fetchStacks.run(),
    fetchEnvironments.run(),
    fetchApps.run(),
    fetchDatabases.run(),
    fetchDatabaseImages.run(),
    fetchBackups.run(),
    fetchLogDrains.run(),
    fetchMetricDrains.run(),
    fetchServices.run(),
    fetchEndpoints.run(),
    fetchOperationsByOrgId.run({ id: org.id, page: 1 }),
    fetchSystemStatus.run(),
    fetchSources.run(),
    fetchDeployments.run(),
    fetchMembershipsByOrgId.run({ orgId: org.id }),
  ]);
  yield* group;
}

function* onRefreshData() {
  yield* onFetchRequiredData();
  yield* onFetchResourceData();
}

export const refreshData = createAction("REFRESH_DATA");
function* watchRefreshData() {
  yield* takeEvery(`${refreshData}`, onRefreshData);
}

export const sagas = { watchRefreshData };
