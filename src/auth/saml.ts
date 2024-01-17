import { authApi } from "@app/api";
import { defaultHalHref } from "@app/hal";
import { HalEmbedded, LinkResponse } from "@app/types";

export interface SamlConfigurationResponse {
  id: string;
  entity_id: string;
  sign_in_url: string;
  sign_out_url: string;
  name_format: string;
  certificate: string;
  certificate_fingerprint: string;
  certificate_fingerprint_algo: string;
  aptible_certificate: string;
  aptible_private_key: string;
  created_at: string;
  updated_at: string;
  handle: string;
  _links: {
    organization: LinkResponse;
  };
  _type: "saml_configuration";
}

export const defaultSamlConfigurationResponse = (
  s: Partial<SamlConfigurationResponse> = {},
): SamlConfigurationResponse => {
  const now = new Date().toISOString();
  return {
    id: "",
    entity_id: "",
    sign_in_url: "",
    sign_out_url: "",
    name_format: "",
    certificate: "",
    certificate_fingerprint: "",
    certificate_fingerprint_algo: "",
    aptible_certificate: "",
    aptible_private_key: "",
    created_at: now,
    updated_at: now,
    handle: "",
    _links: {
      organization: defaultHalHref(),
    },
    _type: "saml_configuration",
    ...s,
  };
};

export type FetchSamlConfigurations = HalEmbedded<{
  saml_configurations: SamlConfigurationResponse[];
}>;

export const fetchSamlConfigurations = authApi.get<
  never,
  FetchSamlConfigurations
>("/saml_configurations", authApi.cache());

export interface AllowlistMemberships {
  id: string;
  deleted_at: string;
  created_at: string;
  updated_at: string;
  _links: {
    organization: LinkResponse;
    user: LinkResponse;
  };
  _type: "whitelist_membership";
}

const prepareXml = (xml: string) => {
  return window.btoa(xml.trim());
};

export interface CreateSamlConfiguration {
  orgId: string;
  metadata: string;
  metadataUrl: string;
}

export const createSamlConfiguration = authApi.post<CreateSamlConfiguration>(
  "/organizations/:orgId/saml_configurations",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        metadata: prepareXml(ctx.payload.metadata),
        metadata_url: ctx.payload.metadataUrl.trim(),
      }),
    });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Success!" };
  },
);

export interface UpdateSamlConfiguration {
  samlId: string;
  metadata: string;
  metadataUrl: string;
}

export const updateSamlConfiguration = authApi.patch<UpdateSamlConfiguration>(
  "/saml_configurations/:samlId",
  function* (ctx, next) {
    ctx.request = ctx.req({
      body: JSON.stringify({
        metadata: prepareXml(ctx.payload.metadata),
        metadata_url: ctx.payload.metadataUrl.trim(),
      }),
    });
    yield* next();

    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { message: "Success!" };
  },
);

export const updateSamlHandle = authApi.patch<{
  samlId: string;
  handle: string;
}>(["/saml_configurations/:samlId", "handle"], function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      handle: ctx.payload.handle,
    }),
  });
  yield* next();

  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { message: "Success!" };
});

export const deleteSamlConfiguration = authApi.delete<{ id: string }>(
  "/saml_configurations/:id",
);

export type FetchAllowlistMemberships = HalEmbedded<{
  whitelist_memberships: AllowlistMemberships[];
}>;

export const fetchAllowlistMemberships = authApi.get<
  { orgId: string },
  FetchAllowlistMemberships
>("/organizations/:orgId/whitelist_memberships", authApi.cache());

export const addAllowlistMembership = authApi.post<
  { orgId: string; userId: string },
  AllowlistMemberships
>("/organizations/:orgId/whitelist_memberships", function* (ctx, next) {
  ctx.request = ctx.req({
    body: JSON.stringify({
      user_id: ctx.payload.userId,
    }),
  });
  yield* next();
});

export const deleteAllowlistMembership = authApi.delete<{ id: string }>(
  "/whitelist_memberships/:id",
  authApi.cache(),
);
