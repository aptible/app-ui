import { ThunkCtx, thunks } from "@app/api";
import { fetchCurrentToken, fetchOrganizations } from "@app/auth";
import { fetchBillingDetail } from "@app/billing";
import {
  fetchApps,
  fetchDatabaseImages,
  fetchDatabases,
  fetchEndpoints,
  fetchEnvironments,
  fetchLogDrains,
  fetchMetricDrains,
  fetchOrgOperations,
  fetchServices,
  fetchStacks,
} from "@app/deploy";
import { call, parallel, select, spawn, takeEvery } from "@app/fx";
import { createAction } from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { fetchCurrentUserRoles, fetchRoles } from "@app/roles";
import { db, schema } from "@app/schema";
import { fetchSystemStatus } from "@app/system-status";
import { selectAccessToken } from "@app/token";
import { ApiCtx } from "@app/types";
import { fetchUser, fetchUsers, selectCurrentUserId } from "@app/users";

export const FETCH_REQUIRED_DATA = "fetch-required-data";

export const bootup = thunks.create("bootup", function* onBootup(ctx, next) {
  const id = ctx.name;
  yield* schema.update(db.loaders.start({ id }));

  yield* call(() => fetchCurrentToken.run(fetchCurrentToken()));
  const token: string = yield* select(selectAccessToken);
  if (!token) {
    yield* schema.update([
      db.loaders.success({
        id: FETCH_REQUIRED_DATA,
        message: "no token found",
      }),
      db.loaders.success({
        id,
        message: "no token found",
      }),
    ]);
    return;
  }

  yield* fetchOrganizations.run();
  const task = yield* spawn(onFetchRequiredData);
  yield* call(onFetchResourceData);
  yield* task;
  yield* schema.update(db.loaders.success({ id }));
  yield* next();
});

function* onFetchRequiredData() {
  yield* schema.update(db.loaders.start({ id: FETCH_REQUIRED_DATA }));
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  const group = yield* parallel<ApiCtx>([
    fetchUser.run({ userId }),
    fetchBillingDetail.run({ id: org.billingDetailId }),
  ]);
  yield* group;
  yield* schema.update(db.loaders.success({ id: FETCH_REQUIRED_DATA }));
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
    fetchLogDrains.run(),
    fetchMetricDrains.run(),
    fetchServices.run(),
    fetchEndpoints.run(),
    fetchOrgOperations.run({ orgId: org.id }),
    fetchSystemStatus.run(),
  ]);
  yield* group;
}

function* onRefreshData() {
  yield* fetchOrganizations.run();
  const group = yield* parallel([onFetchRequiredData, onFetchResourceData]);
  yield* group;
}

export const refreshData = createAction("REFRESH_DATA");
function* watchRefreshData() {
  const task = yield* takeEvery(`${refreshData}`, onRefreshData);
  yield* task;
}

export const sagas = { watchRefreshData };
