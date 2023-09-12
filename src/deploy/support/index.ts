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

    let data = {
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
      message: "Success!",
    };
  },
);

export const queryAlgoliaApi = thunks.create<{ query: string, debounce: boolean }>(
  "query-algolia",
  function* (ctx, next) {
    const { query, debounce } = ctx.payload;

    if (!query || debounce) {
      return
    }

    yield* put(setLoaderStart({ id: ctx.key }));
    const resp = yield* call(
      fetch,
      `https://6C0QTHJH2V-dsn.algolia.net/1/indexes/docs/query?x-algolia-api-key=b14dbd7f78ae21d0a844c64cecc52cf5&x-algolia-application-id=6C0QTHJH2V`,
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
      let data = yield* call([resp, 'json'])
      yield* put(setLoaderSuccess({ id: ctx.key, meta: { hits: data.hits } }));
  },
);

// Need to implement as a api.post that can handle formData, passing the file in the body does not work.
export const uploadAttachment = async (attachment: File) => {
  const formData = new FormData();

  formData.append("file", attachment);

  const request = await fetch(
    `${import.meta.env.VITE_API_URL}/support/upload`,
    {
      body: formData,
      method: "post",
    },
  );
  const response = await request.json();

  return {
    token: response.token,
    filename: attachment.name,
  };
};