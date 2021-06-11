import { User } from '@app/types';
import { extractIdFromLink } from '@app/hal';
import { UserResponse } from './types';

export const defaultUser = (u: Partial<User> = {}): User => {
  return {
    id: '',
    name: 'Aptible',
    email: '',
    otpEnabled: false,
    superuser: false,
    username: '',
    verified: false,
    currentOtpId: '',
    ...u,
  };
};

export function deserializeUser(u: UserResponse): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    otpEnabled: u.otp_enabled,
    superuser: u.superuser,
    username: u.username,
    verified: u.verified,
    currentOtpId: extractIdFromLink(u._links.current_otp_configuration?.href),
  };
}
