import { InvitationRequest } from '@app/types';

export const HOME_PATH = '/';
export const homeUrl = () => HOME_PATH;
export const NOT_FOUND_PATH = '/404';
export const notFoundUrl = () => NOT_FOUND_PATH;

export const LOGIN_PATH = '/login';
export const loginUrl = () => LOGIN_PATH;
export const LOGOUT_PATH = '/logout';
export const logoutUrl = () => LOGOUT_PATH;
export const SIGNUP_PATH = '/signup';
export const signupUrl = () => SIGNUP_PATH;
export const ELEVATE_PATH = '/elevate';
export const elevateUrl = (redirect = '') =>
  `${ELEVATE_PATH}?redirect=${redirect}`;

export const SECURITY_SETTINGS_PATH = '/settings/security';
export const securitySettingsUrl = () => SECURITY_SETTINGS_PATH;
export const SSH_SETTINGS_PATH = '/settings/ssh';
export const sshSettingsUrl = () => SSH_SETTINGS_PATH;
export const OTP_SETUP_PATH = '/settings/otp-setup';
export const otpSetupUrl = () => OTP_SETUP_PATH;
export const OTP_RECOVERY_CODES_PATH = '/settings/otp-recovery-codes';
export const otpRecoveryCodesUrl = () => OTP_RECOVERY_CODES_PATH;
export const ADD_SECURITY_KEY_PATH = '/settings/add-security-key';
export const addSecurityKeyUrl = () => ADD_SECURITY_KEY_PATH;

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

export const APPS_PATH = '/apps';
export const appsUrl = () => APPS_PATH;
export const APP_DETAIL_PATH = '/apps/:id';
export const appDetailUrl = (id: string) => `/apps/${id}`;
export const APP_OVERVIEW_PATH = `${APP_DETAIL_PATH}/overview`;
export const appOverviewUrl = (id: string) => `/apps/${id}/overview`;
export const DATABASES_PATH = '/databases';
export const databasesUrl = () => DATABASES_PATH;
export const SETTINGS_PATH = '/settings';
export const settingsUrl = () => SETTINGS_PATH;
export const TEAM_PATH = `${SETTINGS_PATH}/team`;
export const teamUrl = () => TEAM_PATH;
