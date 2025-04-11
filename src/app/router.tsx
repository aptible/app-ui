import * as routes from "@app/routes";
import {
  AccountOwnerRequired,
  ActivityPage,
  AddSecurityKeyPage,
  AllRequired,
  AppActivityPage,
  AppCreateEndpointPage,
  AppDeployConfigurePage,
  AppDeployGetStartedPage,
  AppDeployResumePage,
  AppDeployResumeWithEnvPage,
  AppDeployStatusPage,
  AppDeployWithGitAddKeyPage,
  AppDeployWithGitPage,
  AppDeployWithGithubPage,
  AppDetailCiCdGuidePage,
  AppDetailCiCdPage,
  AppDetailConfigPage,
  AppDetailDeploymentsPage,
  AppDetailDepsPage,
  AppDetailEndpointsPage,
  AppDetailLayout,
  AppDetailPage,
  AppDetailServiceMetricsPage,
  AppDetailServicePage,
  AppDetailServiceScalePage,
  AppDetailServiceSettingsPage,
  AppDetailServicesPage,
  AppSettingsPage,
  AppSidebarLayout,
  AppsPage,
  AuthRequired,
  BackupRestorePage,
  BillingMethodPage,
  CertDetailAppsPage,
  CertDetailEndpointsPage,
  CertDetailLayout,
  CertDetailPage,
  CertDetailSettingsPage,
  CreateAppPage,
  CreateDatabasePage,
  CreateEnvironmentPage,
  CreateLogDrainPage,
  CreateMetricDrainPage,
  CreateOrgPage,
  CreateStackPage,
  CustomResourceDetailPage,
  CustomResourcesPage,
  DatabaseActivityPage,
  DatabaseBackupsPage,
  DatabaseClusterPage,
  DatabaseCreateEndpointPage,
  DatabaseCredentialsPage,
  DatabaseDetailLayout,
  DatabaseDetailPage,
  DatabaseEndpointsPage,
  DatabaseMetricsPage,
  DatabaseScalePage,
  DatabaseSettingsPage,
  DatabasesPage,
  DeployPage,
  DeploymentDetailConfigPage,
  DeploymentDetailLogsPage,
  DeploymentDetailPage,
  DeploymentsPage,
  DiagnosticsCreatePage,
  DiagnosticsDetailPage,
  DiagnosticsPage,
  ElevatePage,
  ElevateRequired,
  EndpointDetailActivityPage,
  EndpointDetailCredentialsPage,
  EndpointDetailLayout,
  EndpointDetailPage,
  EndpointDetailSettingsPage,
  EndpointDetailSetupPage,
  EndpointsPage,
  EnvSelectorPage,
  EnvironmentActivityPage,
  EnvironmentActivityReportsPage,
  EnvironmentAppsPage,
  EnvironmentBackupsPage,
  EnvironmentCertificatesPage,
  EnvironmentDatabasesPage,
  EnvironmentDetailCreateCertPage,
  EnvironmentDetailLayout,
  EnvironmentDetailPage,
  EnvironmentIntegrationsPage,
  EnvironmentSecurityPage,
  EnvironmentSettingsPage,
  EnvironmentsPage,
  ErrorPage,
  ForgotPassPage,
  ForgotPassVerifyPage,
  GetStartedPage,
  HomePage,
  ImpersonatePage,
  LoginPage,
  LogoutPage,
  NotFoundPage,
  OpDetailLayout,
  OpDetailPage,
  OrgPickerPage,
  OtpRecoveryCodesPage,
  OtpResetVerifyPage,
  OtpSetupPage,
  PlansPage,
  ReactRouterErrorElement,
  RoleDetailEnvironmentsPage,
  RoleDetailMembersPage,
  RoleDetailPage,
  RoleDetailSettingsPage,
  SSHSettingsPage,
  SearchPage,
  SecuritySettingsPage,
  ServiceDetailLayout,
  ServicesPage,
  SettingsLayout,
  SettingsPage,
  SignupPage,
  SourceDetailAppsPage,
  SourceDetailDeploymentsPage,
  SourceDetailLayout,
  SourceDetailPage,
  SourcesPage,
  SsoDirectPage,
  SsoFailurePage,
  SsoLoginPage,
  SsoTokenCliPage,
  SsoTokenCliReadPage,
  StackDetailEnvironmentsPage,
  StackDetailHidsPage,
  StackDetailLayout,
  StackDetailPage,
  StackDetailVpcPeeringPage,
  StackDetailVpnTunnelsPage,
  StacksPage,
  StylesPage,
  SupportPage,
  TeamAcceptInvitePage,
  TeamContactsPage,
  TeamInvitePage,
  TeamMembersEditPage,
  TeamMembersPage,
  TeamPage,
  TeamPendingInvitesPage,
  TeamRolesCreatePage,
  TeamRolesPage,
  TeamScimPage,
  TeamSsoPage,
  VerifyEmailPage,
  VerifyEmailRequired,
} from "@app/ui";
import { DeploymentDetailLayout } from "@app/ui/layouts/deployment-detail-layout";
import { AppDetailDiagnosticsPage } from "@app/ui/pages/app-detail-diagnostics";
import { EnvironmentEndpointsPage } from "@app/ui/pages/environment-detail-endpoints";
import { GithubIntegrationPage } from "@app/ui/pages/github-integration";
import { SettingsProfilePage } from "@app/ui/pages/settings-profile";
import { SettingsTeamDiagnosticsIntegrationsPage } from "@app/ui/pages/settings-team-diagnostics-integrations";
import { SettingsTeamDiagnosticsIntegrationsAddPage } from "@app/ui/pages/settings-team-diagnostics-integrations-add";
import { SettingsTeamDiagnosticsIntegrationsEditPage } from "@app/ui/pages/settings-team-diagnostics-integrations-edit";
import { SettingsTeamLlmIntegrationsPage } from "@app/ui/pages/settings-team-llm-integrations";
import { SettingsTeamLlmIntegrationsAddPage } from "@app/ui/pages/settings-team-llm-integrations-add";
import { SettingsTeamLlmIntegrationsEditPage } from "@app/ui/pages/settings-team-llm-integrations-edit";
import { SourcesSetupPage } from "@app/ui/pages/sources-setup";
import {
  Navigate,
  type RouteObject,
  createBrowserRouter,
} from "react-router-dom";
import { Tuna } from "./tuna";

const trackingPatch = (appRoute: RouteObject) => ({
  ...appRoute,
  element: (
    <>
      <Tuna />
      {appRoute.element}
    </>
  ),
});

const errorPatch = (appRoute: RouteObject) => ({
  ...appRoute,
  errorElement: <ReactRouterErrorElement />,
});

const applyPatches = (appRoute: RouteObject) =>
  errorPatch(trackingPatch(appRoute));

export const appRoutes: RouteObject[] = [
  {
    path: routes.HOME_PATH,
    element: <AllRequired />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: routes.SEARCH_PATH,
        element: <SearchPage />,
      },

      {
        path: routes.DEPLOYMENTS_PATH,
        element: (
          <AppSidebarLayout>
            <DeploymentsPage />
          </AppSidebarLayout>
        ),
      },

      // legacy deploy-ui "Deployment Monitor" -> app-ui "/deployments"
      {
        path: routes.CREATE_DEPLOYMENTS_PATH,
        element: (
          <AppSidebarLayout>
            <DeploymentsPage />
          </AppSidebarLayout>
        ),
      },

      {
        path: routes.CREATE_STACK_PATH,
        element: (
          <AppSidebarLayout>
            <CreateStackPage />
          </AppSidebarLayout>
        ),
      },

      {
        path: routes.STACKS_PATH,
        children: [
          {
            index: true,
            element: <StacksPage />,
          },
          {
            path: routes.STACK_DETAIL_PATH,
            element: <StackDetailLayout />,
            children: [
              {
                path: routes.STACK_DETAIL_PATH,
                element: <StackDetailPage />,
              },
              {
                path: routes.STACK_DETAIL_ENVS_PATH,
                element: <StackDetailEnvironmentsPage />,
              },
              {
                path: routes.STACK_DETAIL_VPC_PEERING_PATH,
                element: <StackDetailVpcPeeringPage />,
              },
              {
                path: routes.STACK_DETAIL_VPN_TUNNELS_PATH,
                element: <StackDetailVpnTunnelsPage />,
              },
              {
                path: routes.STACK_DETAIL_HIDS_PATH,
                element: <StackDetailHidsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.APP_SERVICE_PATH,
        element: <ServiceDetailLayout />,
        children: [
          {
            index: true,
            element: <AppDetailServicePage />,
          },
          {
            path: routes.APP_SERVICE_METRICS_PATH,
            element: <AppDetailServiceMetricsPage />,
          },
          {
            path: routes.APP_SERVICE_SCALE_PATH,
            element: <AppDetailServiceScalePage />,
          },
          {
            path: routes.APP_SERVICE_SETTINGS_PATH,
            element: <AppDetailServiceSettingsPage />,
          },
        ],
      },

      {
        path: routes.SERVICES_PATH,
        element: <ServicesPage />,
      },

      {
        path: routes.SOURCES_PATH,
        children: [
          {
            index: true,
            element: <SourcesPage />,
          },
          {
            path: routes.SOURCES_SETUP_PATH,
            element: <SourcesSetupPage />,
          },
          {
            path: routes.SOURCE_DETAIL_PATH,
            element: <SourceDetailLayout />,
            children: [
              {
                index: true,
                element: <SourceDetailPage />,
              },
              {
                path: routes.SOURCE_DETAIL_APPS_PATH,
                element: <SourceDetailAppsPage />,
              },
              {
                path: routes.SOURCE_DETAIL_DEPLOYMENTS_PATH,
                element: <SourceDetailDeploymentsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.APPS_PATH,
        children: [
          {
            index: true,
            element: <AppsPage />,
          },

          {
            path: routes.APP_DETAIL_PATH,
            element: <AppDetailLayout />,
            children: [
              {
                index: true,
                element: <AppDetailPage />,
              },
              {
                path: routes.APP_SERVICES_PATH,
                element: <AppDetailServicesPage />,
              },
              {
                path: routes.APP_ACTIVITY_PATH,
                element: <AppActivityPage />,
              },
              {
                path: routes.APP_ENDPOINTS_PATH,
                element: <AppDetailEndpointsPage />,
              },
              {
                path: routes.APP_ENDPOINT_CREATE_PATH,
                element: <AppCreateEndpointPage />,
              },
              {
                path: routes.APP_SETTINGS_PATH,
                element: <AppSettingsPage />,
              },
              {
                path: routes.APP_CONFIG_PATH,
                element: <AppDetailConfigPage />,
              },
              {
                path: routes.APP_CICD_PATH,
                element: <AppDetailCiCdPage />,
              },
              {
                path: routes.APP_CICD_GITHUB_PATH,
                element: <AppDetailCiCdGuidePage />,
              },
              {
                path: routes.APP_DETAIL_DEPS_PATH,
                element: <AppDetailDepsPage />,
              },
              {
                path: routes.APP_DETAIL_DEPLOYMENTS_PATH,
                element: <AppDetailDeploymentsPage />,
              },
              {
                path: routes.APP_DETAIL_DIAGNOSTICS_PATH,
                element: <AppDetailDiagnosticsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.DEPLOYMENT_DETAIL_PATH,
        element: <DeploymentDetailLayout />,
        children: [
          {
            index: true,
            element: <DeploymentDetailPage />,
          },
          {
            path: routes.DEPLOYMENT_DETAIL_LOGS_PATH,
            element: <DeploymentDetailLogsPage />,
          },
          {
            path: routes.DEPLOYMENT_DETAIL_CONFIG_PATH,
            element: <DeploymentDetailConfigPage />,
          },
        ],
      },

      {
        path: routes.BACKUP_RESTORE_PATH,
        element: <BackupRestorePage />,
      },

      {
        path: routes.DATABASES_PATH,
        children: [
          {
            index: true,
            element: <DatabasesPage />,
          },

          {
            path: routes.DATABASE_DETAIL_PATH,
            element: <DatabaseDetailLayout />,
            children: [
              {
                index: true,
                element: <DatabaseDetailPage />,
              },
              {
                path: routes.DATABASE_ENDPOINT_CREATE_PATH,
                element: <DatabaseCreateEndpointPage />,
              },
              {
                path: routes.DATABASE_ENDPOINTS_PATH,
                element: <DatabaseEndpointsPage />,
              },
              {
                path: routes.DATABASE_ACTIVITY_PATH,
                element: <DatabaseActivityPage />,
              },
              {
                path: routes.DATABASE_BACKUPS_PATH,
                element: <DatabaseBackupsPage />,
              },
              {
                path: routes.DATABASE_METRICS_PATH,
                element: <DatabaseMetricsPage />,
              },
              {
                path: routes.DATABASE_CLUSTER_PATH,
                element: <DatabaseClusterPage />,
              },
              {
                path: routes.DATABASE_SCALE_PATH,
                element: <DatabaseScalePage />,
              },
              {
                path: routes.DATABASE_SETTINGS_PATH,
                element: <DatabaseSettingsPage />,
              },
              {
                path: routes.DATABASE_CREDENTIALS_PATH,
                element: <DatabaseCredentialsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.CERT_DETAIL_PATH,
        element: <CertDetailLayout />,
        children: [
          {
            index: true,
            element: <CertDetailPage />,
          },
          {
            path: routes.CERT_DETAIL_APPS_PATH,
            element: <CertDetailAppsPage />,
          },
          {
            path: routes.CERT_DETAIL_ENDPOINTS_PATH,
            element: <CertDetailEndpointsPage />,
          },
          {
            path: routes.CERT_DETAIL_SETTINGS_PATH,
            element: <CertDetailSettingsPage />,
          },
        ],
      },

      {
        path: routes.ENDPOINTS_PATH,
        element: <EndpointsPage />,
      },

      {
        path: routes.ENDPOINT_DETAIL_PATH,
        element: <EndpointDetailLayout />,
        children: [
          {
            index: true,
            element: <EndpointDetailPage />,
          },
          {
            path: routes.ENDPOINT_DETAIL_ACTIVITY_PATH,
            element: <EndpointDetailActivityPage />,
          },
          {
            path: routes.ENDPOINT_DETAIL_SETUP_PATH,
            element: <EndpointDetailSetupPage />,
          },
          {
            path: routes.ENDPOINT_DETAIL_SETTINGS_PATH,
            element: <EndpointDetailSettingsPage />,
          },
          {
            path: routes.ENDPOINT_DETAIL_CREDENDTIALS_PATH,
            element: <EndpointDetailCredentialsPage />,
          },
        ],
      },

      {
        path: routes.CREATE_METRIC_DRAIN_PATH,
        element: <CreateMetricDrainPage />,
      },
      {
        path: routes.CREATE_LOG_DRAIN_PATH,
        element: <CreateLogDrainPage />,
      },

      {
        path: routes.ENVIRONMENTS_PATH,
        children: [
          {
            index: true,
            element: <EnvironmentsPage />,
          },

          {
            path: routes.ENVIRONMENT_DETAIL_PATH,
            element: <EnvironmentDetailLayout />,
            children: [
              {
                index: true,
                element: <EnvironmentDetailPage />,
              },
              {
                path: routes.ENVIRONMENT_APPS_PATH,
                element: <EnvironmentAppsPage />,
              },
              {
                path: routes.ENVIRONMENT_DATABASES_PATH,
                element: <EnvironmentDatabasesPage />,
              },
              {
                path: routes.ENVIRONMENT_SECURITY_PATH,
                element: <EnvironmentSecurityPage />,
              },
              {
                path: routes.ENVIRONMENT_INTEGRATIONS_PATH,
                element: <EnvironmentIntegrationsPage />,
              },
              {
                path: routes.ENVIRONMENT_CREATE_CERT_PATH,
                element: <EnvironmentDetailCreateCertPage />,
              },
              {
                path: routes.ENVIRONMENT_CERTIFICATES_PATH,
                element: <EnvironmentCertificatesPage />,
              },
              {
                path: routes.ENVIRONMENT_ACTIVITY_PATH,
                element: <EnvironmentActivityPage />,
              },
              {
                path: routes.ENVIRONMENT_ACTIVITY_REPORTS_PATH,
                element: <EnvironmentActivityReportsPage />,
              },
              {
                path: routes.ENVIRONMENT_BACKUPS_PATH,
                element: <EnvironmentBackupsPage />,
              },
              {
                path: routes.ENVIRONMENT_SETTINGS_PATH,
                element: <EnvironmentSettingsPage />,
              },
              {
                path: routes.ENVIRONMENT_ENDPOINTS_PATH,
                element: <EnvironmentEndpointsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.DIAGNOSTICS_URL,
        children: [
          {
            index: true,
            element: <DiagnosticsPage />,
          },
          {
            path: routes.DIAGNOSTICS_CREATE_URL,
            element: <DiagnosticsCreatePage />,
          },
          {
            path: routes.DIAGNOSTICS_DETAIL_URL,
            element: <DiagnosticsDetailPage />,
          },
        ],
      },

      {
        path: routes.SOFTWARE_CATALOG_URL,
        element: <CustomResourcesPage />,
      },
      {
        path: routes.SOFTWARE_CATALOG_DETAIL_URL,
        element: <CustomResourceDetailPage />,
      },
      {
        path: routes.CUSTOM_RESOURCES_URL,
        element: <Navigate to={routes.SOFTWARE_CATALOG_URL} replace />,
      },
      {
        path: routes.CUSTOM_RESOURCE_DETAIL_URL,
        element: (
          <Navigate to={routes.softwareCatalogDetailUrl(":id")} replace />
        ),
      },

      {
        path: routes.CREATE_DB_PATH,
        element: <CreateDatabasePage />,
      },

      {
        path: routes.IMPERSONATE_PATH,
        element: <ImpersonatePage />,
      },

      {
        path: routes.ACTIVITY_PATH,
        element: <ActivityPage />,
      },

      {
        path: routes.OPERATION_DETAIL_PATH,
        element: <OpDetailLayout />,
        children: [
          {
            index: true,
            element: <OpDetailPage />,
          },
        ],
      },

      {
        path: routes.CREATE_ORG_PATH,
        element: <CreateOrgPage />,
      },

      {
        path: routes.ELEVATE_PATH,
        element: <ElevatePage />,
      },

      {
        path: routes.DEPLOY_PATH,
        element: <DeployPage />,
      },
      {
        path: routes.CREATE_ENV_PATH,
        element: <CreateEnvironmentPage />,
      },
      {
        path: routes.ENV_SELECT_PATH,
        element: <EnvSelectorPage />,
      },
      {
        path: routes.CREATE_APP_PATH,
        element: <CreateAppPage />,
      },
      {
        path: routes.APP_DEPLOY_RESUME_WITH_ENV_PATH,
        element: <AppDeployResumeWithEnvPage />,
      },
      {
        path: routes.APP_DEPLOY_RESUME_PATH,
        element: <AppDeployResumePage />,
      },
      {
        path: routes.APP_DEPLOY_GET_STARTED_PATH,
        element: <AppDeployGetStartedPage />,
      },
      {
        path: routes.APP_DEPLOY_WITH_GIT_PATH,
        element: <AppDeployWithGitPage />,
      },
      {
        path: routes.APP_DEPLOY_WITH_GITHUB_PATH,
        element: <AppDeployWithGithubPage />,
      },
      {
        path: routes.APP_DEPLOY_WITH_GIT_ADD_KEY_PATH,
        element: (
          <ElevateRequired>
            <AppDeployWithGitAddKeyPage />
          </ElevateRequired>
        ),
      },
      {
        path: routes.APP_DEPLOY_CONFIGURE_PATH,
        element: <AppDeployConfigurePage />,
      },
      {
        path: routes.APP_DEPLOY_STATUS_PATH,
        element: <AppDeployStatusPage />,
      },
    ],
  },

  {
    path: routes.ORG_PICKER_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <OrgPickerPage />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
  },

  {
    path: routes.LOGOUT_PATH,
    element: (
      <AuthRequired>
        <LogoutPage />
      </AuthRequired>
    ),
  },

  {
    path: routes.VERIFY_EMAIL_REQUEST_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailPage />
      </AuthRequired>
    ),
  },

  {
    path: routes.VERIFY_EMAIL_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailPage />
      </AuthRequired>
    ),
  },

  {
    path: routes.OTP_RESET_VERIFY_PATH,
    element: <OtpResetVerifyPage />,
  },

  {
    path: routes.PLANS_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <PlansPage />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
  },

  {
    path: routes.BILLING_METHOD_PAGE,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <BillingMethodPage />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
  },

  {
    path: routes.GET_STARTED_PATH,
    element: <GetStartedPage />,
  },

  {
    path: routes.SUPPORT_URL,
    element: <SupportPage />,
  },

  {
    path: routes.SETTINGS_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <SettingsLayout />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <SettingsPage />,
      },

      {
        path: routes.SETTINGS_PROFILE_PATH,
        element: <SettingsProfilePage />,
      },
    ],
  },

  {
    path: routes.SETTINGS_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <ElevateRequired>
            <SettingsLayout />
          </ElevateRequired>
        </VerifyEmailRequired>
      </AuthRequired>
    ),
    children: [
      {
        path: routes.SECURITY_SETTINGS_PATH,
        element: <SecuritySettingsPage />,
      },

      {
        path: routes.SSH_SETTINGS_PATH,
        element: <SSHSettingsPage />,
      },

      {
        path: routes.OTP_SETUP_PATH,
        element: <OtpSetupPage />,
      },

      {
        path: routes.OTP_RECOVERY_CODES_PATH,
        element: <OtpRecoveryCodesPage />,
      },

      {
        path: routes.ADD_SECURITY_KEY_PATH,
        element: <AddSecurityKeyPage />,
      },
    ],
  },

  {
    path: routes.TEAM_ROLES_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <AppSidebarLayout />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <TeamRolesPage />,
      },
    ],
  },

  {
    path: routes.TEAM_GITHUB_INTEGRATION_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <AppSidebarLayout />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <GithubIntegrationPage />,
      },
    ],
  },

  {
    path: routes.TEAM_PATH,
    element: (
      <AuthRequired>
        <VerifyEmailRequired>
          <SettingsLayout />
        </VerifyEmailRequired>
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <TeamPage />,
      },

      {
        path: routes.TEAM_MEMBERS_PATH,
        element: <TeamMembersPage />,
      },

      {
        path: routes.TEAM_MEMBERS_EDIT_PATH,
        element: <TeamMembersEditPage />,
      },

      {
        path: routes.TEAM_INVITE_PATH,
        element: <TeamInvitePage />,
      },

      {
        path: routes.TEAM_PENDING_INVITES_PATH,
        element: <TeamPendingInvitesPage />,
      },

      {
        path: routes.TEAM_SSO_PATH,
        element: (
          <AccountOwnerRequired>
            <TeamSsoPage />
          </AccountOwnerRequired>
        ),
      },

      {
        path: routes.TEAM_SCIM_PATH,
        element: (
          <AccountOwnerRequired>
            <TeamScimPage />
          </AccountOwnerRequired>
        ),
      },

      {
        path: routes.TEAM_CONTACTS_PATH,
        element: (
          <AccountOwnerRequired>
            <TeamContactsPage />
          </AccountOwnerRequired>
        ),
      },

      {
        path: routes.TEAM_DIAGNOSTICS_INTEGRATIONS_PATH,
        element: <SettingsTeamDiagnosticsIntegrationsPage />,
      },

      {
        path: routes.TEAM_DIAGNOSTICS_INTEGRATIONS_ADD_PATH,
        element: <SettingsTeamDiagnosticsIntegrationsAddPage />,
      },

      {
        path: routes.TEAM_DIAGNOSTICS_INTEGRATIONS_EDIT_PATH,
        element: <SettingsTeamDiagnosticsIntegrationsEditPage />,
      },

      {
        path: routes.TEAM_LLM_INTEGRATIONS_PATH,
        element: <SettingsTeamLlmIntegrationsPage />,
      },

      {
        path: routes.TEAM_LLM_INTEGRATIONS_ADD_PATH,
        element: <SettingsTeamLlmIntegrationsAddPage />,
      },

      {
        path: routes.TEAM_LLM_INTEGRATIONS_EDIT_PATH,
        element: <SettingsTeamLlmIntegrationsEditPage />,
      },

      {
        path: routes.TEAM_ROLES_CREATE_PATH,
        element: <TeamRolesCreatePage />,
      },
    ],
  },

  {
    path: routes.TEAM_ACCEPT_INVITE_PATH,
    element: (
      <AuthRequired redirectTo={routes.signupUrl()}>
        <TeamAcceptInvitePage />
      </AuthRequired>
    ),
  },

  {
    path: routes.ROLE_DETAIL_PATH,
    element: (
      <AuthRequired>
        <AppSidebarLayout />
      </AuthRequired>
    ),
    children: [
      {
        index: true,
        element: <RoleDetailPage />,
      },
      {
        path: routes.ROLE_DETAIL_MEMBERS_PATH,
        element: <RoleDetailMembersPage />,
      },
      {
        path: routes.ROLE_DETAIL_ENVIRONMENTS_PATH,
        element: <RoleDetailEnvironmentsPage />,
      },
      {
        path: routes.ROLE_DETAIL_SETTINGS_PATH,
        element: <RoleDetailSettingsPage />,
      },
    ],
  },

  {
    path: routes.LOGIN_PATH,
    element: <LoginPage />,
  },

  {
    path: routes.SIGNUP_PATH,
    element: <SignupPage />,
  },

  {
    path: routes.FORGOT_PASS_PATH,
    element: <ForgotPassPage />,
  },

  {
    path: routes.RESET_PASSWORD_PATH,
    element: <ForgotPassVerifyPage />,
  },

  {
    path: routes.SSO_ORG_FAILURE_PATH,
    element: <SsoFailurePage />,
  },

  {
    path: routes.SSO_PATH,
    element: <SsoLoginPage />,
  },

  {
    path: routes.SSO_DIRECT_PATH,
    element: <SsoDirectPage />,
  },

  {
    path: routes.SSO_TOKEN_CLI_PATH,
    element: <SsoTokenCliPage />,
  },

  {
    path: routes.SSO_TOKEN_CLI_READ_PATH,
    element: <SsoTokenCliReadPage />,
  },

  {
    path: routes.NOT_FOUND_PATH,
    element: <NotFoundPage />,
  },

  {
    path: routes.ERROR_PATH,
    element: <ErrorPage />,
  },

  {
    path: routes.STYLES_PATH,
    element: <StylesPage />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
].map(applyPatches);

export const router = createBrowserRouter(appRoutes);
