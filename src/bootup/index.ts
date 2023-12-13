import { ThunkCtx, thunks } from "@app/api";
import {
  AUTH_LOADER_ID,
  fetchCurrentToken,
  fetchCurrentUserRoles,
  fetchOrganizations,
  fetchRoles,
} from "@app/auth";
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
import {
  call,
  parallel,
  put,
  select,
  setLoaderStart,
  setLoaderSuccess,
  spawn,
  take,
  takeEvery,
} from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { fetchSystemStatus } from "@app/system-status";
import { selectAccessToken } from "@app/token";
import { AnyAction, ApiCtx } from "@app/types";
import { fetchUser, fetchUsers, selectCurrentUserId } from "@app/users";
import { createAction } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

export const FETCH_REQUIRED_DATA = "fetch-required-data";

export const bootup = thunks.create("bootup", function* onBootup(ctx, next) {
  const id = ctx.name;
  yield* put(setLoaderStart({ id }));
  // wait for redux-persist to rehydrate redux store
  yield* take(REHYDRATE);

  yield* call(() => fetchCurrentToken.run(fetchCurrentToken()));
  const token: string = yield* select(selectAccessToken);
  if (!token) {
    yield* put(
      setLoaderSuccess({
        id: FETCH_REQUIRED_DATA,
        message: "no token found",
      }),
    );
    yield* put(setLoaderSuccess({ id, message: "no token found" }));
    return;
  }

  yield* call(() => fetchOrganizations.run(fetchOrganizations()));
  const task = yield* spawn(onFetchRequiredData);
  yield* call(onFetchResourceData);
  yield* task;
  yield* put(setLoaderSuccess({ id }));
  yield* next();
});

function* onFetchRequiredData() {
  yield* put(setLoaderStart({ id: FETCH_REQUIRED_DATA }));
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  const group = yield* parallel<ApiCtx>([
    () => fetchUser.run(fetchUser({ userId })),
    () =>
      fetchBillingDetail.run(fetchBillingDetail({ id: org.billingDetailId })),
  ]);
  yield* group;
  yield* put(setLoaderSuccess({ id: FETCH_REQUIRED_DATA }));
}

function* onFetchResourceData() {
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  const group = yield* parallel<ThunkCtx>([
    () => fetchUsers.run(fetchUsers({ orgId: org.id })),
    () => fetchRoles.run(fetchRoles({ orgId: org.id })),
    () => fetchCurrentUserRoles.run(fetchCurrentUserRoles({ userId: userId })),
    () => fetchStacks.run(fetchStacks()),
    () => fetchEnvironments.run(fetchEnvironments()),
    () => fetchApps.run(fetchApps()),
    () => fetchDatabases.run(fetchDatabases()),
    () => fetchDatabaseImages.run(fetchDatabaseImages()),
    () => fetchLogDrains.run(fetchLogDrains()),
    () => fetchMetricDrains.run(fetchMetricDrains()),
    () => fetchServices.run(fetchServices()),
    () => fetchEndpoints.run(fetchEndpoints()),
    () => fetchOrgOperations.run(fetchOrgOperations({ orgId: org.id })),
    () => fetchSystemStatus.run(fetchSystemStatus()),
  ]);
  yield* group;
}

function* onRefreshData() {
  yield* call(() => fetchOrganizations.run(fetchOrganizations()));
  const group = yield* parallel([onFetchRequiredData, onFetchResourceData]);
  yield* group;
}

export const refreshData = createAction("REFRESH_DATA");

function* watchRefreshData() {
  const act = (action: AnyAction) => {
    const matched =
      action.type === `${setLoaderSuccess}` &&
      action.payload?.id === AUTH_LOADER_ID;
    return matched;
  };
  const task = yield* takeEvery(act, onRefreshData);
  yield* task;
}

function* watchData() {
  const task = yield* takeEvery(`${refreshData}`, onRefreshData);
  yield* task;
}

export const sagas = { watchRefreshData, watchData };
