import { type ThunkCtx, thunks } from "@app/api";
import {
  fetchCurrentToken,
  fetchMembershipsByOrgId,
  fetchOrganizations,
} from "@app/auth";
import { fetchBillingDetail } from "@app/billing";
import {
  emptyFilterProps,
  fetchApps,
  fetchCostRates,
  fetchCostsByApps,
  fetchCostsByDatabases,
  fetchCostsByEnvironments,
  fetchCostsByServices,
  fetchCostsByStacks,
  fetchCustomResources,
  fetchDatabaseImages,
  fetchDatabases,
  fetchEndpoints,
  fetchEnvironments,
  fetchLogDrains,
  fetchManualScaleRecommendations,
  fetchMetricDrains,
  fetchOperationsByOrgId,
  fetchServiceSizingPolicies,
  fetchServices,
  fetchStacks,
} from "@app/deploy";
import { fetchDeployments } from "@app/deployment";
import { call, parallel, put, select, takeEvery } from "@app/fx";
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
  yield* fetchRoles.run({ orgId: org.id });
  yield* fetchCurrentUserRoles.run({ userId: userId });

  yield* schema.update(schema.loaders.success({ id: FETCH_REQUIRED_DATA }));
}

function* onFetchCostData(orgId: string) {
  yield* put(fetchCostsByStacks({ orgId }));
  yield* put(fetchCostsByEnvironments({ orgId }));
  yield* put(fetchCostsByApps({ orgId }));
  yield* put(fetchCostsByDatabases({ orgId }));
  yield* put(fetchCostsByServices({ orgId }));
  yield* put(fetchCostRates({ orgId }));
}

function* onFetchResourceData() {
  const org = yield* select(selectOrganizationSelected);
  const group = yield* parallel<ThunkCtx>([
    fetchUsers.run({ orgId: org.id }),
    fetchStacks.run(),
    fetchEnvironments.run(),
    fetchApps.run(),
    fetchDatabaseImages.run(),
    fetchDatabases.run(),
    fetchLogDrains.run(),
    fetchMetricDrains.run(),
    fetchServices.run(),
    fetchEndpoints.run(),
    fetchOperationsByOrgId.run({ id: org.id, page: 1, ...emptyFilterProps }),
    fetchSystemStatus.run(),
    fetchSources.run(),
    fetchDeployments.run(),
    fetchMembershipsByOrgId.run({ orgId: org.id }),
    fetchServiceSizingPolicies.run(),
    fetchManualScaleRecommendations.run(),
    fetchCustomResources.run(),
  ]);
  yield* onFetchCostData(org.id);
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
