import { HalEmbedded, LinkResponse } from '@app/types';

export interface UserResponse {
  created_at: string;
  email: string;
  id: string;
  name: string;
  otp_enabled: boolean;
  public_key_fingerprint: null;
  ssh_public_key: null;
  superuser: boolean;
  updated_at: string;
  username: string;
  verified: boolean;
  _links: {
    email_verification_challenges: LinkResponse;
    otp_configuration: LinkResponse;
    roles: LinkResponse;
    self: LinkResponse;
    ssh_keys: LinkResponse;
    u2f_devices: LinkResponse;
  };
}

export type UsersResponse = HalEmbedded<{ users: UserResponse[] }>;

export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  context: string;
  challenge_token: string;
}
