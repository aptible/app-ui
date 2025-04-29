import { api, thunks } from "@app/api";
import { schema } from "@app/schema";

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
    yield* schema.update(schema.loaders.resetByIds([`${createSupportTicket}`]));
    yield* next();
  },
);

interface AttachmentProps {
  attachment: File;
  callback: (p: { token: string; filename: string }) => void;
  errorCallback?: (message: string | null) => void;
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
      let errorMessage = "File upload failed. Please try again.";

      if (ctx.json.error && typeof ctx.json.error.message === "string") {
        errorMessage = ctx.json.error.message;
      }

      // Call errorCallback if provided
      if (ctx.payload.errorCallback) {
        ctx.payload.errorCallback(errorMessage);
      }

      ctx.loader = {
        message: `Error! ${errorMessage}`,
      };
      return;
    }

    ctx.payload.callback({
      token: `${ctx.json.value.token}`,
      filename: `${ctx.payload.attachment.name}`,
    });

    // Clear any previous errors if success
    if (ctx.payload.errorCallback) {
      ctx.payload.errorCallback(null);
    }

    ctx.loader = {
      message: ctx.json.value.message,
    };
  },
);
