import { call, put, select } from "saga-query";

import { thunks } from "@app/api";
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
import { fetchUsers } from "@app/users";

export const fetchInitialData = thunks.create(
  "fetch-init-data",
  function* (_, next) {
    yield* call(fetchOrganizations.run, fetchOrganizations());
    const org = yield* select(selectOrganizationSelected);
    yield* put(fetchUsers({ orgId: org.id }));
    yield* put(fetchAllStacks());
    yield* put(fetchAllEnvironments());
    yield* put(fetchAllApps());
    yield* put(fetchAllDatabases());
    yield next();
  },
);
