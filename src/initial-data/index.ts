import { all, call, select, setLoaderSuccess, takeEvery } from "@app/fx";

import {
  AUTH_LOADER_ID,
  fetchCurrentUserRoles,
  fetchOrganizations,
  fetchRoles,
} from "@app/auth";
import {
  fetchAllApps,
  fetchAllDatabases,
  fetchAllEndpoints,
  fetchAllEnvironments,
  fetchAllLogDrains,
  fetchAllMetricDrains,
  fetchAllServices,
  fetchAllStacks,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { AnyAction } from "@app/types";
import { fetchUsers, selectCurrentUserId } from "@app/users";

export function* onFetchInitData() {
  yield* call(fetchOrganizations.run, fetchOrganizations());
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  yield* all([
    call(fetchUsers.run, fetchUsers({ orgId: org.id })),
    call(fetchRoles.run, fetchRoles({ orgId: org.id })),
    call(fetchCurrentUserRoles.run, fetchCurrentUserRoles({ userId: userId })),
    call(fetchAllStacks.run, fetchAllStacks()),
    call(fetchAllEnvironments.run, fetchAllEnvironments()),
    call(fetchAllApps.run, fetchAllApps()),
    call(fetchAllDatabases.run, fetchAllDatabases()),
    call(fetchAllLogDrains.run, fetchAllLogDrains()),
    call(fetchAllMetricDrains.run, fetchAllMetricDrains()),
    call(fetchAllServices.run, fetchAllServices()),
    call(fetchAllEndpoints.run, fetchAllEndpoints()),
  ]);
}

function* watchFetchInitData() {
  const act = (action: AnyAction) => {
    const matched =
      action.type === `${setLoaderSuccess}` &&
      action.payload?.id === AUTH_LOADER_ID;
    return matched;
  };
  yield* takeEvery(act, onFetchInitData);
}

export const sagas = { watchFetchInitData };
