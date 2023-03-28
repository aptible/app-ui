import { REHYDRATE } from "redux-persist";
import { call, put, select, take } from "saga-query";

import { thunks } from "@app/api";
import { fetchCurrentToken } from "@app/auth";
import {
  fetchAllApps,
  fetchAllDatabases,
  fetchAllEnvironments,
  fetchAllStacks,
} from "@app/deploy";
import {
  fetchOrganizations,
  selectOrganizationSelected,
} from "@app/organizations";
import { selectAccessToken } from "@app/token";
import { ApiGen } from "@app/types";
import { fetchUsers } from "@app/users";

export const bootup = thunks.create(
  "bootup",
  function* onBootup(_, next): ApiGen {
    // wait for redux-persist to rehydrate redux store
    yield* take(REHYDRATE);
    yield* call(fetchCurrentToken.run, fetchCurrentToken());
    const token: string = yield* select(selectAccessToken);
    if (!token) {
      return;
    }

    yield* call(fetchData);

    yield next();
  },
);

function* fetchData(): ApiGen {
  yield* call(fetchOrganizations.run, fetchOrganizations());
  const org = yield* select(selectOrganizationSelected);
  yield* put(fetchUsers({ orgId: org.id }));
  yield* put(fetchAllStacks());
  yield* put(fetchAllEnvironments());
  yield* put(fetchAllApps());
  yield* put(fetchAllDatabases());
}
