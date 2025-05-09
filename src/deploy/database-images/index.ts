import { api, cacheTimer } from "@app/api";
import { createSelector, select, takeLeading } from "@app/fx";
import { defaultEntity } from "@app/hal";
import { type WebState, schema } from "@app/schema";
import type { DeployDatabaseImage } from "@app/types";

export interface DeployDatabaseImageResponse {
  id: number;
  default: boolean;
  description: string;
  discoverable: boolean;
  docker_repo: string;
  type: string;
  version: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
  eol_at: string;
  pitr_supported: boolean;
  _type: "database_image";
}

export const defaultDatabaseImageResponse = (
  i: Partial<DeployDatabaseImageResponse> = {},
): DeployDatabaseImageResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    default: true,
    description: "",
    discoverable: true,
    docker_repo: "",
    type: "",
    version: "",
    visible: true,
    eol_at: "",
    pitr_supported: false,
    created_at: now,
    updated_at: now,
    _type: "database_image",
    ...i,
  };
};

export const deserializeDeployDatabaseImage = (
  payload: DeployDatabaseImageResponse,
): DeployDatabaseImage => {
  return {
    id: `${payload.id}`,
    default: payload.default,
    description: payload.description,
    discoverable: payload.discoverable,
    dockerRepo: payload.docker_repo,
    eolAt: payload.eol_at,
    type: payload.type,
    version: payload.version,
    visible: payload.visible,
    pitrSupported: payload.pitr_supported,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
  };
};

export const hasDeployDatabaseImage = (a: DeployDatabaseImage) => a.id !== "";
export const selectDatabaseImageById = schema.databaseImages.selectById;
export const selectDatabaseImages = schema.databaseImages.selectTable;
export const findDatabaseImageById = schema.databaseImages.findById;
export const selectDatabaseImagesAsList = createSelector(
  schema.databaseImages.selectTableAsList,
  (imgs) =>
    [...imgs].sort((a, b) => {
      return b.description.localeCompare(a.description, "en", {
        numeric: true,
      });
    }),
);
export const selectDatabaseImagesVisible = createSelector(
  selectDatabaseImagesAsList,
  (images) => images.filter((img) => img.visible),
);

export const fetchDatabaseImages = api.get("/database_images?per_page=5000", {
  supervisor: cacheTimer(),
});

export const fetchDatabaseImageById = api.get<{ id: string }>(
  "/database_images/:id",
  { supervisor: takeLeading },
  function* (ctx, next) {
    const img = yield* select((s: WebState) =>
      schema.databaseImages.selectById(s, { id: ctx.payload.id }),
    );
    // only fetch individual db images if they don't already exist in our
    // system.  this should be relatively safe since these image objects
    // dont update very often
    if (img.id !== "") {
      return;
    }
    yield* next();
  },
);

export const databaseImageEntities = {
  database_image: defaultEntity({
    id: "database_image",
    deserialize: deserializeDeployDatabaseImage,
    save: schema.databaseImages.add,
  }),
};
