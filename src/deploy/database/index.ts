import { defaultEntity, extractIdFromLink } from "@app/hal";
import type { AppState, DeployDatabase } from "@app/types";
import { api, cacheTimer } from "@app/api";
import {
	createReducerMap,
	createTable,
	mustSelectEntity,
} from "@app/slice-helpers";

import { deserializeOperation } from "../operation";
import { deserializeDisk } from "../disk";
import { selectDeploy } from "../slice";

export const deserializeDeployDatabase = (payload: any): DeployDatabase => {
	const embedded = payload._embedded;
	const links = payload._links;

	return {
		connectionUrl: payload.connectionUrl,
		createdAt: payload.created_at,
		updatedAt: payload.updated_at,
		currentKmsArn: payload.current_kms_arn,
		dockerRepo: payload.docker_repo,
		handle: payload.handle,
		id: payload.id,
		provisioned: payload.provisioned,
		type: payload.type,
		status: payload.status,
		environmentId: extractIdFromLink(links.account),
		serviceId: extractIdFromLink(links.service),
		disk: deserializeDisk(embedded.disk),
		lastOperation: deserializeOperation(embedded.last_operation),
	};
};

export const defaultDeployDatabase = (
	d: Partial<DeployDatabase> = {},
): DeployDatabase => {
	const now = new Date().toISOString();
	return {
		id: "",
		status: "pending",
		handle: "",
		connectionUrl: "",
		createdAt: now,
		updatedAt: now,
		currentKmsArn: "",
		dockerRepo: "",
		provisioned: false,
		type: "",
		environmentId: "",
		serviceId: "",
		disk: null,
		lastOperation: null,
		...d,
	};
};

export const DEPLOY_DATABASE_NAME = "databases";
const slice = createTable<DeployDatabase>({
	name: DEPLOY_DATABASE_NAME,
});
const { add: addDeployDatabases } = slice.actions;
const selectors = slice.getSelectors(
	(s: AppState) => selectDeploy(s)[DEPLOY_DATABASE_NAME],
);
const initApp = defaultDeployDatabase();
const must = mustSelectEntity(initApp);
export const selectDatabaseById = must(selectors.selectById);
export const { selectTableAsList: selectDatabasesAsList } = selectors;
export const hasDeployDatabase = (a: DeployDatabase) => a.id != "";
export const databaseReducers = createReducerMap(slice);

export const fetchDatabases = api.get("/databases", { saga: cacheTimer() });
export const fetchDatabase = api.get<{ id: string }>("/databases/:id");
export const fetchDatabaseOperations = api.get<{ id: string }>(
	"/databases/:id/operations",
	{ saga: cacheTimer() },
	api.cache(),
);
export const fetchDatabaseBackups = api.get<{ id: string }>(
	"/databases/:id/backups",
	{ saga: cacheTimer() },
	api.cache(),
);

export const databaseEntities = {
	database: defaultEntity({
		id: "database",
		deserialize: deserializeDeployDatabase,
		save: addDeployDatabases,
	}),
};
