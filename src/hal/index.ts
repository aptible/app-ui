import { Next, select } from "@app/fx";

import { createAssign, createReducerMap } from "@app/slice-helpers";
import type {
  Action,
  AppState,
  DeployApiCtx,
  EmbeddedMap,
  EntityMap,
  HalEmbedded,
  IdEntity,
  MapEntity,
  NestedEntity,
  ResourceType,
} from "@app/types";

export const defaultHalHref = (href = ""): { href: string } => {
  return { href };
};

export function extractIdFromLink(
  relation: { href: string } | null | undefined,
) {
  if (!relation?.href) {
    return "";
  }
  const segments = relation.href.split("/");
  return segments[segments.length - 1] || "";
}

/**
 * deploy-api does not provide the resource type so we have to convert a route, e.g. `/apps/:id` to `app`.
 * It appears to be as simple as a singularize method but that's not a certainty.
 */
function transformResourceName(name: string | undefined | null): ResourceType {
  switch (name) {
    case "apps":
      return "app";
    case "databases":
      return "database";
    case "vhosts":
      return "vhost";
    case "ephemeral_sessions":
      return "ephemeral_session";
    case "backups":
      return "backup";
    case "services":
      return "service";
    case "releases":
      return "release";
    default:
      return "unknown";
  }
}

export function extractResourceNameFromLink(
  resource: { href: string } | null | undefined,
): ResourceType {
  if (!resource?.href) {
    return "unknown";
  }

  const res = resource.href.split("/");
  return transformResourceName(res[res.length - 2]);
}

export const ENTITIES_NAME = "entities";
const entities = createAssign<EntityMap>({
  name: ENTITIES_NAME,
  initialState: {},
});
export const reducers = createReducerMap(entities);
const selectEntities = (state: AppState) => state[ENTITIES_NAME] || {};

export function defaultEntity<E = any>(e: EmbeddedMap<E>): EmbeddedMap<E> {
  return e;
}

export function* halEntityParser(
  ctx: DeployApiCtx<any, HalEmbedded<{ [key: string]: any }>>,
  next: Next,
) {
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  const entityMap: EntityMap = yield select(selectEntities);
  const { data } = ctx.json;

  const actions: Action<any>[] = [];
  const store: { [key: string]: IdEntity[] } = {};

  const parser = (
    entity?: NestedEntity | HalEmbedded<{ [key: string]: any }>,
  ) => {
    if (!entity) {
      return;
    }

    if (entity._type) {
      const identified = entityMap[entity._type];
      if (identified) {
        if (!store[identified.id]) {
          store[identified.id] = [];
        }
        store[identified.id].push(identified.deserialize(entity));
      }
    }

    if (!entity._embedded) {
      return;
    }

    Object.values(entity._embedded).forEach((value) => {
      if (Array.isArray(value)) {
        value.forEach(parser);
      } else {
        parser(value);
      }
    });
  };

  parser(data);

  Object.keys(store).forEach((key) => {
    const entity = entityMap[key];
    if (!entity) {
      return;
    }

    const storeData = store[key];
    if (storeData.length === 0) {
      return;
    }

    const dataObj = storeData.reduce<MapEntity<any>>((acc, em) => {
      acc[em.id] = em;
      return acc;
    }, {});

    actions.push(entity.save(dataObj));
  });

  if (actions.length > 0) {
    ctx.actions.push(...actions);
  }
}
