import { Next, Operation, StoreUpdater, select } from "@app/fx";
import { WebState, schema } from "@app/schema";
import type {
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
): string {
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
    case "containers":
      return "container";
    case "vpc_peers":
      return "vpc_peer";
    case "vpn_tunnels":
      return "vpn_tunnel";
    case "log_drains":
      return "log_drain";
    case "metric_drains":
      return "metric_drain";
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

const selectEntities = schema.entities.selectTable;

export function defaultEntity<E = any>(e: EmbeddedMap<E>): EmbeddedMap<E> {
  return e;
}

export function* halEntityParser(
  ctx: DeployApiCtx<any, HalEmbedded<{ [key: string]: any }>>,
  next: Next,
): Operation<any> {
  yield* next();

  const result = ctx.json;
  if (!result.ok) {
    return;
  }

  const entityMap: EntityMap = yield* select(selectEntities);
  const { value } = result;

  const updaters: StoreUpdater<WebState>[] = [];
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

  parser(value);

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

    updaters.push(entity.save(dataObj));
  });

  yield* schema.update(updaters);
}
