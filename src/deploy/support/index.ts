import { api, thunks } from "@app/api";
import { call } from "@app/fx";
import { db, schema } from "@app/schema";

interface SupportTicketProps {
  email: string;
  description: string;
  subject: string;
  attachments: Array<string>;
  priority: string;
  name: string;
}

export const createSupportTicket = api.post<SupportTicketProps>(
  "/support/create",
  function* (ctx, next) {
    const { subject, description, email, name, priority, attachments } =
      ctx.payload;

    const data = {
      subject: subject || "",
      description: description || "",
      email: email || "",
      name: name || "",
      priority: priority || "",
      attachments: attachments.length > 0 ? attachments : [],
    };

    const body = JSON.stringify(data);
    ctx.request = ctx.req({ body });
    yield* next();

    if (!ctx.json.ok) {
      ctx.loader = {
        message: `Error! Unable to create the support ticket: ${ctx.json.error.message}`,
      };
      return;
    }

    ctx.loader = {
      message:
        "Request submitted successfully! Check your email for confirmation.",
    };
  },
);

export const resetSupportTicket = thunks.create(
  "reset-support-ticket",
  function* (_, next) {
    yield* schema.update(db.loaders.resetByIds([`${createSupportTicket}`]));
    yield* next();
  },
);

export const queryAlgoliaApi = thunks.create<{
  query: string;
  debounce: boolean;
}>("query-algolia", function* (ctx, next) {
  const { query, debounce } = ctx.payload;

  if (!query || debounce) {
    yield* next();
    return;
  }

  yield* schema.update(db.loaders.start({ id: ctx.key }));
  const resp = yield* call(() =>
    fetch(
      "https://6C0QTHJH2V-dsn.algolia.net/1/indexes/docs/query?x-algolia-api-key=b14dbd7f78ae21d0a844c64cecc52cf5&x-algolia-application-id=6C0QTHJH2V",
      {
        method: "POST",
        headers: {
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
          query: query,
          hitsPerPage: 5,
        }),
      },
    ),
  );
  const data = yield* call(() => resp.json());
  yield* schema.update(
    db.loaders.success({ id: ctx.key, meta: { hits: data.hits } as any }),
  );
  yield* next();
});

interface AttachmentProps {
  attachment: File;
  callback: (p: { token: string; filename: string }) => void;
}

export const uploadAttachment = api.post<AttachmentProps>(
  "/support/upload",
  function* (ctx, next) {
    const formData = new FormData();
    formData.append("file", ctx.payload.attachment);

    ctx.request = ctx.req({ body: formData });
    ctx.request.headers = new Headers();

    yield* next();

    if (!ctx.json.ok) {
      ctx.loader = {
        message: `Error! Unable to create the support ticket: ${ctx.json.error.message}`,
      };
      return;
    }
    ctx.payload.callback({
      token: `${ctx.json.value.token}`,
      filename: `${ctx.payload.attachment.name}`,
    });
    ctx.loader = {
      message: ctx.json.value.message,
    };
  },
);
