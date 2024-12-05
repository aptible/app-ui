import { thunks } from "@app/api";
import { schema } from "@app/schema";
import type { ModalState, ModalType } from "@app/types";

export const readNotice = thunks.create<ModalType>(
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

export const openModal = thunks.create<ModalState>(
  "open-modal",
  function* (ctx, next) {
    yield* schema.update(schema.modal.set(ctx.payload));
    yield* next();
  },
);

export const closeModal = thunks.create("close-modal", function* (_, next) {
  yield* schema.update(schema.modal.reset());
  yield* next();
});