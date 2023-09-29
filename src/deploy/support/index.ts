import { api, thunks } from "@app/api";

import { call, put, setLoaderStart, setLoaderSuccess } from "@app/fx";

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
        message: `Error! Unable to create the support ticket: ${ctx.json.data.message}`,
      };
      return;
    }

    ctx.loader = {
      message:
        "Request submitted successfully! Check your email for confirmation.",
    };
  },
);

export const queryAlgoliaApi = thunks.create<{
  query: string;
  debounce: boolean;
}>("query-algolia", function* (ctx, next) {
  const { query, debounce } = ctx.payload;

  if (!query || debounce) {
    return;
  }

  yield* put(setLoaderStart({ id: ctx.key }));
  const resp = yield* call(
    fetch,
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
  );
  const data = yield* call([resp, "json"]);
  yield* put(setLoaderSuccess({ id: ctx.key, meta: { hits: data.hits } }));
});

interface AttachmentProps {
  attachment: File;
  callback: Function;
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
        message: `Error! Unable to create the support ticket: ${ctx.json.data.message}`,
      };
      return;
    }
    ctx.payload.callback({
      token: `${ctx.json.data.token}`,
      filename: `${ctx.payload.attachment.name}`,
    });
    ctx.loader = {
      message: ctx.json.data.message,
    };
  },
);
