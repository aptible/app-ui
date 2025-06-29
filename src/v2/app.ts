import { v2api } from "@app/api";
import { schema } from "@app/schema";
import type { V2App } from "@app/types";

export const fetchV2Apps = v2api.get<never, { apps: V2App[] }>("/apps", [
  function* (ctx, next) {
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    // convert array to map
    const appMap = ctx.json.value.apps.reduce<{ [key: string]: V2App }>(
      (map, app) => {
        map[app.id] = app;
        return map;
      },
      {},
    );
    yield* schema.update(schema.v2Apps.set(appMap));
  },
  // delete this when we want to hit the real API
  function* (ctx, next) {
    ctx.response = new Response(
      JSON.stringify({
        apps: [
          { id: "1", handle: "Example App" },
          { id: "2", handle: "Nginx" },
        ],
      }),
      { status: 200 },
    );
    yield* next();
  },
]);
