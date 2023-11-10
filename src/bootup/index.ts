import { thunks } from "@app/api";
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
  all,
  call,
  fork,
  put,
  select,
  setLoaderStart,
  setLoaderSuccess,
  take,
  takeEvery,
} from "@app/fx";
import { selectOrganizationSelected } from "@app/organizations";
import { selectAccessToken } from "@app/token";
import { AnyAction, ApiGen } from "@app/types";
import { fetchUsers, selectCurrentUserId } from "@app/users";
import { REHYDRATE } from "redux-persist";

export const FETCH_REQUIRED_DATA = "fetch-required-data";

export const bootup = thunks.create(
  "bootup",
  function* onBootup(ctx, next): ApiGen {
    const id = ctx.name;
    yield* put(setLoaderStart({ id }));
    // wait for redux-persist to rehydrate redux store
    yield* take(REHYDRATE);

    yield* call(fetchCurrentToken.run, fetchCurrentToken());
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

    yield* call(fetchOrganizations.run, fetchOrganizations());
    yield* fork(onFetchRequiredData);
    yield* call(onFetchResourceData);
    yield* put(setLoaderSuccess({ id }));
    yield* next();
  },
);

function* onFetchRequiredData() {
  yield* put(setLoaderStart({ id: FETCH_REQUIRED_DATA }));
  const org = yield* select(selectOrganizationSelected);
  yield* all([
    call(fetchUsers.run, fetchUsers({ orgId: org.id })),
    call(
      fetchBillingDetail.run,
      fetchBillingDetail({ id: org.billingDetailId }),
    ),
  ]);
  yield* put(setLoaderSuccess({ id: FETCH_REQUIRED_DATA }));
}

function* onFetchResourceData() {
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  yield* all([
    call(fetchRoles.run, fetchRoles({ orgId: org.id })),
    call(fetchCurrentUserRoles.run, fetchCurrentUserRoles({ userId: userId })),
    call(fetchStacks.run, fetchStacks()),
    call(fetchEnvironments.run, fetchEnvironments()),
    call(fetchApps.run, fetchApps()),
    call(fetchDatabases.run, fetchDatabases()),
    call(fetchDatabaseImages.run, fetchDatabaseImages()),
    call(fetchLogDrains.run, fetchLogDrains()),
    call(fetchMetricDrains.run, fetchMetricDrains()),
    call(fetchServices.run, fetchServices()),
    call(fetchEndpoints.run, fetchEndpoints()),
    call(fetchOrgOperations.run, fetchOrgOperations({ orgId: org.id })),
  ]);
}

function* onRefreshData() {
  yield* all([call(onFetchRequiredData), call(onFetchResourceData)]);
}

function* watchRefreshData() {
  const act = (action: AnyAction) => {
    const matched =
      action.type === `${setLoaderSuccess}` &&
      action.payload?.id === AUTH_LOADER_ID;
    return matched;
  };
  yield* takeEvery(act, onRefreshData);
}

export const sagas = { watchRefreshData };
