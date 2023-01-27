import { InvitationRequest } from "@app/types";

export const HOME_PATH = "/";
export const homeUrl = () => HOME_PATH;
export const NOT_FOUND_PATH = "/404";
export const notFoundUrl = () => NOT_FOUND_PATH;

export const LOGIN_PATH = "/login";
export const loginUrl = () => LOGIN_PATH;
export const LOGOUT_PATH = "/logout";
export const logoutUrl = () => LOGOUT_PATH;
export const SIGNUP_PATH = "/signup";
export const signupUrl = () => SIGNUP_PATH;
export const ELEVATE_PATH = "/elevate";
export const elevateUrl = (redirect = "") =>
  `${ELEVATE_PATH}?redirect=${redirect}`;

export const SECURITY_SETTINGS_PATH = "/settings/security";
export const securitySettingsUrl = () => SECURITY_SETTINGS_PATH;
export const SSH_SETTINGS_PATH = "/settings/ssh";
export const sshSettingsUrl = () => SSH_SETTINGS_PATH;
export const OTP_SETUP_PATH = "/settings/otp-setup";
export const otpSetupUrl = () => OTP_SETUP_PATH;
export const OTP_RECOVERY_CODES_PATH = "/settings/otp-recovery-codes";
export const otpRecoveryCodesUrl = () => OTP_RECOVERY_CODES_PATH;
export const ADD_SECURITY_KEY_PATH = "/settings/add-security-key";
export const addSecurityKeyUrl = () => ADD_SECURITY_KEY_PATH;

export const RESET_REQUEST_PASSWORD_PATH = "/reset-password";
export const RESET_PASSWORD_PATH =
  "/reset-password/:challengeId/:verificationCode";
export const VERIFY_EMAIL_REQUEST_PATH = "/verify";
export const verifyEmailRequestUrl = () => VERIFY_EMAIL_REQUEST_PATH;
export const VERIFY_EMAIL_PATH = "/verify/:verificationId/:verificationCode";
export const verifyEmailUrl = (
  verificationId: string,
  verificationCode: string,
) => `/verify/${verificationId}/${verificationCode}`;

export const CREATE_ORG_PATH = "/organizations/create";
export const createOrgUrl = () => CREATE_ORG_PATH;

export const ACCEPT_INVITATION_WITH_CODE_PATH =
  "/accept-invitation/:invitationId/:verificationCode";
export const acceptInvitationWithCodeUrl = (props: InvitationRequest) =>
  `/accept-invitation/${props.invitationId}/${props.verificationCode}`;
export const ACCEPT_INVITATION_WITHOUT_CODE_PATH =
  "/accept-invitation/:invitationId";
export const acceptInvitationWithoutCodeUrl = (invitationId: string) =>
  `/accept-invitation/${invitationId}`;

export const APPS_PATH = "/apps";
export const appsUrl = () => APPS_PATH;
export const APP_DETAIL_PATH = "/apps/:id";
export const appDetailUrl = (id: string) => `/apps/${id}`;
export const APP_ACTIVITY_PATH = `${APP_DETAIL_PATH}/activity`;
export const appActivityUrl = (id: string) => `${appDetailUrl(id)}/activity`;
export const APP_SECURITY_PATH = `${APP_DETAIL_PATH}/security`;
export const appSecurityUrl = (id: string) => `${appDetailUrl(id)}/security`;
export const APP_SETTINGS_PATH = `${APP_DETAIL_PATH}/settings`;
export const appSettingsUrl = (id: string) => `${appDetailUrl(id)}/settings`;

export const DATABASES_PATH = "/databases";
export const databasesUrl = () => DATABASES_PATH;
export const DATABASE_DETAIL_PATH = "/databases/:id";
export const databaseDetailUrl = (id: string) => `/databases/${id}`;
export const DATABASE_ACTIVITY_PATH = `${DATABASE_DETAIL_PATH}/activity`;
export const databaseActivityUrl = (id: string) =>
  `${databaseDetailUrl(id)}/activity`;
export const DATABASE_SECURITY_PATH = `${DATABASE_DETAIL_PATH}/security`;
export const databaseSecurityUrl = (id: string) =>
  `${databaseDetailUrl(id)}/security`;
export const DATABASE_BACKUPS_PATH = `${DATABASE_DETAIL_PATH}/backups`;
export const databaseBackupsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/backups`;
export const DATABASE_SETTINGS_PATH = `${DATABASE_DETAIL_PATH}/settings`;
export const databaseSettingsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/settings`;

export const SETTINGS_PATH = "/settings";
export const settingsUrl = () => SETTINGS_PATH;
export const TEAM_PATH = `${SETTINGS_PATH}/team`;
export const teamUrl = () => TEAM_PATH;

export const CREATE_PROJECT = "/create";
export const createProjectUrl = () => CREATE_PROJECT;
export const CREATE_PROJECT_GIT = "/create/git";
export const createProjectGitUrl = () => CREATE_PROJECT_GIT;
