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
export const IMPERSONATE_PATH = "/impersonate";
export const impersonateUrl = () => IMPERSONATE_PATH;

export const FORGOT_PASS_PATH = "/forgot-password";
export const forgotPassUrl = () => FORGOT_PASS_PATH;
export const RESET_PASSWORD_PATH =
  "/password/update/:challengeId/:verificationCode";
export const resetPassVerifyUrl = (
  challengeId: string,
  verificationCode: string,
) => `/password/update/${challengeId}/${verificationCode}`;

export const VERIFY_EMAIL_REQUEST_PATH = "/verify";
export const verifyEmailRequestUrl = () => VERIFY_EMAIL_REQUEST_PATH;
export const VERIFY_EMAIL_PATH = "/verify/:verificationId/:verificationCode";
export const verifyEmailUrl = (
  verificationId: string,
  verificationCode: string,
) => `/verify/${verificationId}/${verificationCode}`;

export const PLANS_PATH = "/plans";
export const plansUrl = () => PLANS_PATH;

export const BILLING_METHOD_PAGE = "/billing";
export const billingMethodUrl = () => BILLING_METHOD_PAGE;

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
export const APP_SERVICES_PATH = `${APP_DETAIL_PATH}/services`;
export const appServicesUrl = (id: string) => `${appDetailUrl(id)}/services`;
export const APP_ACTIVITY_PATH = `${APP_DETAIL_PATH}/activity`;
export const appActivityUrl = (id: string) => `${appDetailUrl(id)}/activity`;
export const APP_ENDPOINTS_PATH = `${APP_DETAIL_PATH}/endpoints`;
export const appEndpointsUrl = (id: string) => `${appDetailUrl(id)}/endpoints`;
export const APP_SETTINGS_PATH = `${APP_DETAIL_PATH}/settings`;
export const appSettingsUrl = (id: string) => `${appDetailUrl(id)}/settings`;

export const DATABASES_PATH = "/databases";
export const databaseUrl = () => DATABASES_PATH;
export const DATABASE_DETAIL_PATH = "/databases/:id";
export const databaseDetailUrl = (id: string) => `/databases/${id}`;
export const DATABASE_ENDPOINTS_PATH = `${DATABASE_DETAIL_PATH}/endpoints`;
export const databaseEndpointsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/endpoints`;
export const DATABASE_ACTIVITY_PATH = `${DATABASE_DETAIL_PATH}/activity`;
export const databaseActivityUrl = (id: string) =>
  `${databaseDetailUrl(id)}/activity`;
export const DATABASE_BACKUPS_PATH = `${DATABASE_DETAIL_PATH}/backups`;
export const databaseBackupsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/backups`;
export const DATABASE_CLUSTER_PATH = `${DATABASE_DETAIL_PATH}/cluster`;
export const databaseClusterUrl = (id: string) =>
  `${databaseDetailUrl(id)}/cluster`;
export const DATABASE_SCALE_PATH = `${DATABASE_DETAIL_PATH}/scale`;
export const databaseScaleUrl = (id: string) =>
  `${databaseDetailUrl(id)}/scale`;
export const DATABASE_SETTINGS_PATH = `${DATABASE_DETAIL_PATH}/settings`;
export const databaseSettingsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/settings`;

export const DEPLOYMENTS_PATH = "/deployments";
export const deploymentsUrl = () => DEPLOYMENTS_PATH;

export const ENVIRONMENTS_PATH = "/environments";
export const environmentsUrl = () => ENVIRONMENTS_PATH;
export const ENVIRONMENT_DETAIL_PATH = "/environments/:id";
export const environmentDetailUrl = (id: string) => `/environments/${id}`;
export const ENVIRONMENT_RESOURCES_PATH = "/environments/:id/resources";
export const environmentResourcelUrl = (id: string) =>
  `/environments/${id}/resources`;
export const ENVIRONMENT_SECURITY_PATH = "/environments/:id/security";
export const environmentSecurityUrl = (id: string) =>
  `/environments/${id}/security`;
export const ENVIRONMENT_INTEGRATIONS_PATH = "/environments/:id/integrations";
export const environmentIntegrationsUrl = (id: string) =>
  `/environments/${id}/integrations`;
export const ENVIRONMENT_CERTIFICATES_PATH = "/environments/:id/certificates";
export const environmentCertificatesUrl = (id: string) =>
  `/environments/${id}/certificates`;
export const ENVIRONMENT_ACTIVITY_PATH = "/environments/:id/activity";
export const environmentActivityUrl = (id: string) =>
  `/environments/${id}/activity`;
export const ENVIRONMENT_BACKUPS_PATH = "/environments/:id/backups";
export const environmentBackupsUrl = (id: string) =>
  `/environments/${id}/backups`;
export const ENVIRONMENT_SETTINGS_PATH = "/environments/:id/settings";
export const environmentSettingsUrl = (id: string) =>
  `/environments/${id}/settings`;

export const ERROR_PATH = "/error";

export const SETTINGS_PATH = "/settings";
export const settingsUrl = () => SETTINGS_PATH;
export const TEAM_PATH = `${SETTINGS_PATH}/team`;
export const teamUrl = () => TEAM_PATH;

export const CREATE_PROJECT_PATH = "/create";
export const createProjectUrl = () => CREATE_PROJECT_PATH;
export const CREATE_PROJECT_ADD_KEY_PATH = "/create/ssh";
export const createProjectAddKeyUrl = () => CREATE_PROJECT_ADD_KEY_PATH;
export const CREATE_PROJECT_ADD_NAME_PATH = "/create/name";
export const createProjectAddNameUrl = () => CREATE_PROJECT_ADD_NAME_PATH;

export const CREATE_PROJECT_GIT_PATH = "/create/git";
export const createProjectGitUrl = () => CREATE_PROJECT_GIT_PATH;

export const CREATE_PROJECT_SETUP_PATH = "/accounts/:envId/setup";
export const createProjectSetupUrl = (envId: string) =>
  `/accounts/${envId}/setup`;
export const CREATE_PROJECT_APP_SETUP_PATH = "/apps/:appId/git/setup";
export const createProjectGitAppSetupUrl = (appId: string) =>
  `/apps/${appId}/git/setup`;

export const CREATE_PROJECT_GIT_APP_PATH = "/apps/:appId/git";
export const createProjectGitAppUrl = (appId: string) => `/apps/${appId}/git`;
export const CREATE_PROJECT_GIT_PUSH_PATH = "/apps/:appId/git/push";
export const createProjectGitPushUrl = (appId: string) =>
  `/apps/${appId}/git/push`;
export const CREATE_PROJECT_GIT_SETTINGS_PATH = "/apps/:appId/git/settings";
export const createProjectGitSettingsUrl = (appId: string, query = "") =>
  `/apps/${appId}/git/settings${query ? `?${query}` : ""}`;
export const CREATE_PROJECT_GIT_STATUS_PATH = "/apps/:appId/git/status";
export const createProjectGitStatusUrl = (appId: string) =>
  `/apps/${appId}/git/status`;

export const SSO_PATH = "/sso";
export const ssoUrl = () => SSO_PATH;
export const SSO_DIRECT_PATH = "/sso/:orgId";
export const ssoDirectUrl = (orgId: string) => `/sso/${orgId}`;
export const SSO_ORG_FAILURE_PATH = "/sso/failure";
export const ssoFailureUrl = (message = "") =>
  `${SSO_ORG_FAILURE_PATH}?message=${message}`;

export const ACTIVITY_PATH = "/activity";
export const activityUrl = () => ACTIVITY_PATH;
export const OPERATION_DETAIL_PATH = "/operations/:id";
export const operationDetailUrl = (id: string) => `/operations/${id}`;
