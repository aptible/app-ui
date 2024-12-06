import { thunks } from "@app/api";
import { schema } from "@app/schema";
import type { NoticeType } from "@app/types";

export const readNotice = thunks.create<NoticeType>(
  "read-notice",
  function* (ctx, next) {
    yield* schema.update(
      schema.notices.update({
        key: ctx.payload,
        value: new Date().toISOString(),
      }),
    );
    yield* next();
  },
);
