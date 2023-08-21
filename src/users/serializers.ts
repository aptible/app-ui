import { defaultHalHref, extractIdFromLink } from "@app/hal";
import type { User } from "@app/types";

import type { UserResponse } from "./types";

export const defaultUser = (u: Partial<User> = {}): User => {
  return {
    id: "",
    name: "Aptible",
    email: "",
    otpEnabled: false,
    superuser: false,
    readOnlyImpersonate: false,
    username: "",
    verified: false,
    currentOtpId: "",
    selectedOrganizationId: "",
    ...u,
  };
};

export function deserializeUser(u: UserResponse): User {
  return {
    id: `${u.id}`,
    name: u.name,
    email: u.email,
    otpEnabled: u.otp_enabled,
    readOnlyImpersonate: u.read_only_impersonate,
    superuser: u.superuser,
    username: u.username,
    verified: u.verified,
    selectedOrganizationId: extractIdFromLink(u._links.selected_organization),
    currentOtpId: extractIdFromLink(u._links.current_otp_configuration),
  };
}

export function defaultUserResponse(
  u: Partial<UserResponse> = {},
): UserResponse {
  const now = new Date().toISOString();
  return {
    id: 0,
    name: "",
    email: "",
    otp_enabled: false,
    superuser: false,
    read_only_impersonate: false,
    username: "",
    verified: false,
    created_at: now,
    updated_at: now,
    public_key_fingerprint: null,
    ssh_public_key: null,
    _links: {
      self: defaultHalHref(),
      roles: defaultHalHref(),
      selected_organization: defaultHalHref(),
      email_verification_challenges: defaultHalHref(),
      current_otp_configuration: defaultHalHref(),
      ssh_keys: defaultHalHref(),
      u2f_devices: defaultHalHref(),
      ...u._links,
    },
    _type: "user",
    ...u,
  };
}
