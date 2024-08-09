import type { HalEmbedded, LinkResponse } from "@app/types";

export interface UserResponse {
  created_at: string;
  email: string;
  id: number;
  name: string;
  otp_enabled: boolean;
  public_key_fingerprint: null;
  ssh_public_key: null;
  superuser: boolean;
  read_only_impersonate: boolean;
  updated_at: string;
  username: string;
  verified: boolean;
  external_id: string;
  _links: {
    email_verification_challenges: LinkResponse;
    current_otp_configuration: LinkResponse;
    roles: LinkResponse;
    self: LinkResponse;
    ssh_keys: LinkResponse;
    u2f_devices: LinkResponse;
    selected_organization?: LinkResponse | null;
  };
  _type: "user";
}

export type UsersResponse = HalEmbedded<{ users: UserResponse[] }>;

export interface CreateUserForm {
  company: string;
  name: string;
  email: string;
  password: string;
  challengeToken: string;
}
