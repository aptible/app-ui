const HUBSPOT_API_URL =
  "https://api.hsforms.com/submissions/v3/integration/submit/20235662/9ff54b8a-a71e-464c-95e5-a7fff6511cac";
const utms = ["utm_campaign", "utm_medium", "utm_source", "utm_term", "gclid"];

interface HubspotField {
  objectTypeId: string;
  name: string;
  value: string;
}

interface HubspotPayload {
  fields: HubspotField[];
  context: {
    pageUri: string;
    pageName: string;
  };
}

const generateField = (field: string, value: string): HubspotField => {
  return {
    objectTypeId: "0-1", // 0-1 is used for Contacts
    name: field,
    value: value,
  };
};

const addUtmsToPayload = (payload: HubspotPayload) => {
  const w = window as any;
  if (typeof w === "undefined") return;
  const params = new URLSearchParams(w.location.search);

  for (const param of utms) {
    const paramValue = params.get(param);
    if (paramValue) {
      payload.fields.push(generateField(param, paramValue));
    }
  }
};

export const submitHubspotForm = async (
  name: string,
  email: string,
  company: string,
  organizationId: string,
) => {
  if (!import.meta.env.PROD) return;

  const [firstName, ...lastName] = name.split(" ");
  const payload: HubspotPayload = {
    fields: [
      generateField("firstname", firstName),
      generateField("lastname", lastName.toString()),
      generateField("email", email),
      generateField("company", company),
      generateField("organization_id", organizationId),
    ],
    context: {
      pageUri: `${window.location.origin}${window.location.pathname}`,
      pageName: window.document.title,
    },
  };

  // Capture UTMs, google click ID from URL
  addUtmsToPayload(payload);

  await fetch(HUBSPOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};
