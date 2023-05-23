import { call, put, select, setLoaderSuccess, takeEvery } from "saga-query";

import { AUTH_LOADER_ID, fetchOrganizations } from "@app/auth";
import {
  fetchAllApps,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchAllStacks,
} from "@app/deploy";
import { selectOrganizationSelected } from "@app/organizations";
import { AnyAction } from "@app/types";
import { fetchUsers } from "@app/users";

export function* onFetchInitData() {
  yield* call(fetchOrganizations.run, fetchOrganizations());
  const org = yield* select(selectOrganizationSelected);
  yield* put(fetchUsers({ orgId: org.id }));
  yield* put(fetchAllStacks());
  yield* put(fetchAllEnvironments());
  yield* put(fetchAllApps());
  yield* put(fetchAllDatabases());
}

export function* watchFetchInitData() {
  const act = (action: AnyAction) => {
    const matched =
      action.type === `${setLoaderSuccess}` &&
      action.payload?.id === AUTH_LOADER_ID;
    return matched;
  };
  yield* takeEvery(act, onFetchInitData);
}
