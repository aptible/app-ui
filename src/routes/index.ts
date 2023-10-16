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
export const ORG_PICKER_PATH = "/organizations/picker";
export const orgPickerUrl = () => ORG_PICKER_PATH;

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
export const APP_SERVICE_PATH = `${APP_DETAIL_PATH}/services/:serviceId`;
export const appServicePathUrl = (appId: string, serviceId: string) =>
  `${appDetailUrl(appId)}/services/${serviceId}`;
export const APP_CONFIG_PATH = `${APP_DETAIL_PATH}/config`;
export const appConfigUrl = (appId: string) => `${appDetailUrl(appId)}/config`;
export const APP_SERVICE_METRICS_PATH = `${APP_DETAIL_PATH}/services/:serviceId/metrics`;
export const appServicePathMetricsUrl = (appId: string, serviceId: string) =>
  `${appDetailUrl(appId)}/services/${serviceId}/metrics`;
export const APP_SERVICE_SCALE_PATH = `${APP_DETAIL_PATH}/services/:serviceId/scale`;
export const appServiceScalePathUrl = (appId: string, serviceId: string) =>
  `${appDetailUrl(appId)}/services/${serviceId}/scale`;
export const APP_ACTIVITY_PATH = `${APP_DETAIL_PATH}/activity`;
export const appActivityUrl = (id: string) => `${appDetailUrl(id)}/activity`;
export const APP_ENDPOINTS_PATH = `${APP_DETAIL_PATH}/endpoints`;
export const appEndpointsUrl = (id: string) => `${appDetailUrl(id)}/endpoints`;
export const APP_ENDPOINT_CREATE_PATH = `${APP_DETAIL_PATH}/endpoints/create`;
export const appEndpointCreateUrl = (id: string) =>
  `${appDetailUrl(id)}/endpoints/create`;
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
export const DATABASE_METRICS_PATH = `${DATABASE_DETAIL_PATH}/metrics`;
export const databaseMetricsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/metrics`;
export const DATABASE_SCALE_PATH = `${DATABASE_DETAIL_PATH}/scale`;
export const databaseScaleUrl = (id: string) =>
  `${databaseDetailUrl(id)}/scale`;
export const DATABASE_SETTINGS_PATH = `${DATABASE_DETAIL_PATH}/settings`;
export const databaseSettingsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/settings`;
export const DATABASE_CREDENTIALS_PATH = `${DATABASE_DETAIL_PATH}/credentials`;
export const databaseCredentialsUrl = (id: string) =>
  `${databaseDetailUrl(id)}/credentials`;
export const DATABASE_ENDPOINT_CREATE_PATH = `${DATABASE_DETAIL_PATH}/endpoints/create`;
export const databaseEndpointCreateUrl = (id: string) =>
  `${databaseDetailUrl(id)}/endpoints/create`;

export const BACKUP_RESTORE_PATH = "/backups/:id/restore";
export const backupRestoreUrl = (id: string) => `/backups/${id}/restore`;

export const ENDPOINT_DETAIL_PATH = "/endpoints/:id";
export const endpointDetailUrl = (id: string) => `/endpoints/${id}`;
export const ENDPOINT_DETAIL_ACTIVITY_PATH = "/endpoints/:id/activity";
export const endpointDetailActivityUrl = (id: string) =>
  `${endpointDetailUrl(id)}/activity`;
export const ENDPOINT_DETAIL_SETUP_PATH = "/endpoints/:id/setup";
export const endpointDetailSetupUrl = (id: string) =>
  `${endpointDetailUrl(id)}/setup`;
export const ENDPOINT_DETAIL_SETTINGS_PATH = "/endpoints/:id/settings";
export const endpointDetailSettingsUrl = (id: string) =>
  `${endpointDetailUrl(id)}/settings`;
export const ENDPOINTS_PATH = "/endpoints";
export const endpointsUrl = () => ENDPOINTS_PATH;
export const ENDPOINT_DETAIL_CREDENDTIALS_PATH = "/endpoints/:id/credentials";
export const endpointDetailCredentialsUrl = (id: string) =>
  `/endpoints/${id}/credentials`;

export const DEPLOYMENTS_PATH = "/deployments";
export const deploymentsUrl = () => DEPLOYMENTS_PATH;

export const ENVIRONMENTS_PATH = "/environments";
export const environmentsUrl = () => ENVIRONMENTS_PATH;
export const ENVIRONMENT_DETAIL_PATH = "/environments/:id";
export const environmentDetailUrl = (id: string) => `/environments/${id}`;
export const ENVIRONMENT_APPS_PATH = "/environments/:id/apps";
export const environmentAppsUrl = (id: string) => `/environments/${id}/apps`;
export const ENVIRONMENT_DATABASES_PATH = "/environments/:id/databases";
export const environmentDatabasesUrl = (id: string) =>
  `/environments/${id}/databases`;
export const ENVIRONMENT_SECURITY_PATH = "/environments/:id/security";
export const environmentSecurityUrl = (id: string) =>
  `/environments/${id}/security`;
export const ENVIRONMENT_INTEGRATIONS_PATH = "/environments/:id/integrations";
export const environmentIntegrationsUrl = (id: string) =>
  `/environments/${id}/integrations`;
export const ENVIRONMENT_CERTIFICATES_PATH = "/environments/:id/certificates";
export const environmentCertificatesUrl = (id: string) =>
  `/environments/${id}/certificates`;
export const ENVIRONMENT_ACTIVITY_REPORTS_PATH =
  "/environments/:id/activity_reports";
export const environmentActivityReportsUrl = (id: string) =>
  `/environments/${id}/activity_reports`;
export const ENVIRONMENT_ACTIVITY_PATH = "/environments/:id/activity";
export const environmentActivityUrl = (id: string) =>
  `/environments/${id}/activity`;
export const ENVIRONMENT_BACKUPS_PATH = "/environments/:id/backups";
export const environmentBackupsUrl = (id: string) =>
  `/environments/${id}/backups`;
export const ENVIRONMENT_SETTINGS_PATH = "/environments/:id/settings";
export const environmentSettingsUrl = (id: string) =>
  `/environments/${id}/settings`;
export const ENVIRONMENT_CREATE_CERT_PATH =
  "/environments/:id/certificates/create";
export const environmentCreateCertUrl = (id: string) =>
  `/environments/${id}/certificates/create`;

export const environmentCreateAppUrl = (id: string) =>
  `/create/name?environment_id=${id}`;
export const environmentCreateDbUrl = (id: string) =>
  `/create/db?environment_id=${id}`;

export const CREATE_DB_PATH = "/create/db";
export const createDbUrl = () => `${CREATE_DB_PATH}`;

export const ERROR_PATH = "/error";

export const SETTINGS_PATH = "/settings";
export const settingsUrl = () => SETTINGS_PATH;
export const TEAM_PATH = `${SETTINGS_PATH}/team`;
export const teamUrl = () => TEAM_PATH;

/*
 * /create -- unauthed page "get started"
 * /create/deployments -- view deployments
 * /create/app -- create a standalone app
 * /create/environment -- create a standalone env
 *
 * /environments/:id/resume -- resume app deployment with just env id
 * /apps/:id/resume -- resume app deployment with just app id
 *
 * /app/:id/get-started -- decision point (git or docker)
 * /app/:id/git -- git push page
 * /app/:id/git/ssh -- add ssh key page
 * /app/:id/deploy/settings -- app configure page (dbs, image registry, env vars, etc)
 * /app/:id/deploy/status -- app deploy status page
 */

export const GET_STARTED_PATH = "/create";
export const getStartedUrl = () => GET_STARTED_PATH;

export const DEPLOY_PATH = "/deploy";
export const deployUrl = (stackId = "") =>
  `${DEPLOY_PATH}${stackId ? `?stack_id=${stackId}` : ""}`;

export const CREATE_DEPLOYMENTS_PATH = "/create/deployments";
export const createDeploymentsUrl = (params = "") =>
  `${CREATE_DEPLOYMENTS_PATH}${params ? `?${params}` : ""}`;

export const CREATE_APP_PATH = "/create/app";
export const createAppUrl = (params = "") => {
  return `${CREATE_APP_PATH}${params ? `?${params}` : ""}`;
};

export const CREATE_ENV_PATH = "/create/environment";
export const createEnvUrl = (params = "") => {
  return `${CREATE_ENV_PATH}${params ? `?${params}` : ""}`;
};

export const ENV_SELECT_PATH = "/select/env";
export const envSelectUrl = (params = "") =>
  `${ENV_SELECT_PATH}${params ? `?${params}` : ""}`;

export const APP_DEPLOY_RESUME_WITH_ENV_PATH = "/environments/:envId/resume";
export const appDeployResumeWithEnvUrl = (envId: string) =>
  `/environments/${envId}/resume`;

export const APP_DEPLOY_RESUME_PATH = "/apps/:appId/resume";
export const appDeployResumeUrl = (appId: string) => `/apps/${appId}/resume`;

export const APP_DEPLOY_GET_STARTED_PATH = "/apps/:appId/get-started";
export const appDeployGetStartedUrl = (appId: string) =>
  `/apps/${appId}/get-started`;

export const APP_DEPLOY_WITH_GIT_PATH = "/apps/:appId/git";
export const appDeployWithGitUrl = (appId: string) => `/apps/${appId}/git`;

export const APP_DEPLOY_WITH_GIT_ADD_KEY_PATH = "/apps/:appId/git/ssh";
export const appDeployWithGitAddKeyUrl = (appId: string) => {
  return `/apps/${appId}/git/ssh`;
};

export const APP_DEPLOY_CONFIGURE_PATH = "/apps/:appId/deploy/configure";
export const appDeployConfigureUrl = (appId: string, query = "") =>
  `/apps/${appId}/deploy/configure${query ? `?${query}` : ""}`;

export const APP_DEPLOY_STATUS_PATH = "/apps/:appId/deploy/status";
export const appDeployStatusUrl = (appId: string) =>
  `/apps/${appId}/deploy/status`;

export const SSO_PATH = "/sso";
export const ssoUrl = () => SSO_PATH;
export const SSO_DIRECT_PATH = "/sso/:orgId";
export const ssoDirectUrl = (orgId: string) => `/sso/${orgId}`;
export const SSO_ORG_FAILURE_PATH = "/sso/failure";
export const ssoFailureUrl = (message = "") =>
  `${SSO_ORG_FAILURE_PATH}?message=${message}`;
export const SSO_TOKEN_CLI_READ_PATH = "/sso/cli/read";
export const ssoTokenReadUrl = () => SSO_TOKEN_CLI_READ_PATH;
export const SSO_TOKEN_CLI_PATH = "/sso/cli";
export const ssoTokenUrl = () => SSO_TOKEN_CLI_PATH;

export const ACTIVITY_PATH = "/activity";
export const activityUrl = () => ACTIVITY_PATH;
export const OPERATION_DETAIL_PATH = "/operations/:id";
export const operationDetailUrl = (id: string) => `/operations/${id}`;

export const STYLES_PATH = "/styles";
export const stylesUrl = () => STYLES_PATH;

export const STACKS_PATH = "/stacks";
export const stacksUrl = () => STACKS_PATH;
export const CREATE_STACK_PATH = "/create/stack";
export const createStackUrl = () => CREATE_STACK_PATH;

export const STACK_DETAIL_PATH = "/stacks/:id";
export const stackDetailUrl = (id: string) => `/stacks/${id}`;
export const STACK_DETAIL_ENVS_PATH = `${STACK_DETAIL_PATH}/environments`;
export const stackDetailEnvsUrl = (id: string) =>
  `${stackDetailUrl(id)}/environments`;
export const STACK_DETAIL_VPN_TUNNELS_PATH = `${STACK_DETAIL_PATH}/vpn-tunnels`;
export const stackDetailVpnTunnelsUrl = (id: string) =>
  `${stackDetailUrl(id)}/vpn-tunnels`;
export const STACK_DETAIL_VPC_PEERING_PATH = `${STACK_DETAIL_PATH}/vpc-peering`;
export const stackDetailVpcPeeringsUrl = (id: string) =>
  `${stackDetailUrl(id)}/vpc-peering`;
export const STACK_DETAIL_HIDS_PATH = `${STACK_DETAIL_PATH}/hids`;
export const stackDetailHidsUrl = (id: string) => `${stackDetailUrl(id)}/hids`;

export const SEARCH_PATH = "/search";
export const searchUrl = () => SEARCH_PATH;

export const securityDashboardUrl = (prefix: string) => `${prefix}/controls`;

export const CERT_DETAIL_PATH = "/certificates/:id";
export const certDetailUrl = (id: string) => `/certificates/${id}`;
export const CERT_DETAIL_APPS_PATH = "/certificates/:id/apps";
export const certDetailAppsUrl = (id: string) => `/certificates/${id}/apps`;
export const CERT_DETAIL_ENDPOINTS_PATH = "/certificates/:id/endpoints";
export const certDetailEndpointsUrl = (id: string) =>
  `/certificates/${id}/endpoints`;
export const CERT_DETAIL_SETTINGS_PATH = "/certificates/:id/settings";
export const certDetailSettingsUrl = (id: string) =>
  `/certificates/${id}/settings`;

export const CREATE_METRIC_DRAIN_PATH = "/metric-drains/create";
export const createMetricDrainUrl = (envId = "") =>
  `${CREATE_METRIC_DRAIN_PATH}${envId ? `?environment_id=${envId}` : ""}`;
export const CREATE_LOG_DRAIN_PATH = "/log-drains/create";
export const createLogDrainUrl = (envId = "") =>
  `${CREATE_LOG_DRAIN_PATH}${envId ? `?environment_id=${envId}` : ""}`;

export const SUPPORT_URL = "/support";
export const supportUrl = () => SUPPORT_URL;
