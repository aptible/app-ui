import { InvitationRequest } from '@app/types';

export const HOME_PATH = '/';
export const homeUrl = () => HOME_PATH;
export const NOT_FOUND_PATH = '/404';
export const notFoundUrl = () => NOT_FOUND_PATH;

export const LOGIN_PATH = '/login';
export const loginUrl = () => LOGIN_PATH;
export const SIGNUP_PATH = '/signup';
export const signupUrl = () => SIGNUP_PATH;

export const RESET_REQUEST_PASSWORD_PATH = '/reset-password';
export const RESET_PASSWORD_PATH =
  '/reset-password/:challengeId/:verificationCode';
export const VERIFY_EMAIL_REQUEST_PATH = '/verify';
export const verifyEmailRequestUrl = () => VERIFY_EMAIL_REQUEST_PATH;
export const VERIFY_EMAIL_PATH = '/verify/:verificationId/:verificationCode';
export const verifyEmailUrl = (
  verificationId: string,
  verificationCode: string,
) => `/verify/${verificationId}/${verificationCode}`;

export const CREATE_ORG_PATH = '/organizations/create';
export const createOrgUrl = () => CREATE_ORG_PATH;

export const ACCEPT_INVITATION_WITH_CODE_PATH =
  '/accept-invitation/:invitationId/:verificationCode';
export const acceptInvitationWithCodeUrl = (props: InvitationRequest) =>
  `/accept-invitation/${props.invitationId}/${props.verificationCode}`;
export const ACCEPT_INVITATION_WITHOUT_CODE_PATH =
  '/accept-invitation/:invitationId';
export const acceptInvitationWithoutCodeUrl = (invitationId: string) =>
  `/accept-invitation/${invitationId}`;
