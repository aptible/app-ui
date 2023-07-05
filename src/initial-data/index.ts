import {
  batchActions,
  call,
  put,
  select,
  setLoaderSuccess,
  takeEvery,
} from "@app/fx";

import {
  AUTH_LOADER_ID,
  fetchCurrentUserRoles,
  fetchOrganizations,
  fetchRoles,
} from "@app/auth";
import {
  fetchAllApps,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchAllStacks,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { AnyAction } from "@app/types";
import { fetchUsers, selectCurrentUserId } from "@app/users";

export function* onFetchInitData() {
  yield* call(fetchOrganizations.run, fetchOrganizations());
  const org = yield* select(selectOrganizationSelected);
  const userId = yield* select(selectCurrentUserId);
  yield* put(
    batchActions([
      fetchUsers({ orgId: org.id }),
      fetchRoles({ orgId: org.id }),
      fetchCurrentUserRoles({ userId: userId }),
      fetchAllStacks(),
      fetchAllEnvironments(),
      fetchAllApps(),
      fetchAllDatabases(),
    ]),
  );
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
