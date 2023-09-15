import { all, call, select, setLoaderSuccess, takeEvery } from "@app/fx";

import {
  AUTH_LOADER_ID,
  fetchCurrentUserRoles,
  fetchOrganizations,
  fetchRoles,
} from "@app/auth";
import {
  fetchApps,
  fetchDatabases,
  fetchEndpoints,
  fetchEnvironments,
  fetchLogDrains,
  fetchMetricDrains,
  fetchOrgOperations,
  fetchServices,
  fetchStacks,
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
    call(fetchStacks.run, fetchStacks()),
    call(fetchEnvironments.run, fetchEnvironments()),
    call(fetchApps.run, fetchApps()),
    call(fetchDatabases.run, fetchDatabases()),
    call(fetchLogDrains.run, fetchLogDrains()),
    call(fetchMetricDrains.run, fetchMetricDrains()),
    call(fetchServices.run, fetchServices()),
    call(fetchEndpoints.run, fetchEndpoints()),
    call(fetchOrgOperations.run, fetchOrgOperations({ orgId: org.id })),
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
