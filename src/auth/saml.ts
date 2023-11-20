import { authApi } from "@app/api";
import { AuthApiError, HalEmbedded, LinkResponse } from "@app/types";

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

export type FetchSamlConfigurations = HalEmbedded<{
  saml_configurations: SamlConfigurationResponse[];
}>;

export const fetchSamlConfigurations = authApi.get<
  never,
  FetchSamlConfigurations,
  AuthApiError
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

export type FetchAllowlistMemberships = HalEmbedded<{
  whitelist_memberships: AllowlistMemberships[];
}>;

export const fetchAllowlistMemberships = authApi.get<
  { orgId: string },
  FetchAllowlistMemberships,
  AuthApiError
>("/organizations/:orgId/whitelist_memberships", authApi.cache());
