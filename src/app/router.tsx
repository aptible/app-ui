import { RouteObject, createBrowserRouter } from "react-router-dom";

import { Tuna } from "./tuna";
import * as routes from "@app/routes";
import {
  AddSecurityKeyPage,
  AppActivityPage,
  AppDetailEndpointsPage,
  AppDetailLayout,
  AppDetailServicesPage,
  AppSettingsPage,
  AppsPage,
  AuthRequired,
  BillingMethodPage,
  CreateOrgPage,
  CreateProjectAddKeyPage,
  CreateProjectFromAccountSetupPage,
  CreateProjectFromAppSetupPage,
  CreateProjectGitPage,
  CreateProjectGitPushPage,
  CreateProjectGitSettingsPage,
  CreateProjectGitStatusPage,
  CreateProjectLayout,
  CreateProjectNamePage,
  CreateProjectPage,
  DatabaseActivityPage,
  DatabaseBackupsPage,
  DatabaseClusterPage,
  DatabaseDetailLayout,
  DatabaseEndpointsPage,
  DatabaseScalePage,
  DatabaseSettingsPage,
  DatabasesPage,
  DeploymentsPage,
  ElevatePage,
  ElevateRequired,
  EnvironmentActivityPage,
  EnvironmentBackupsPage,
  EnvironmentCertificatesPage,
  EnvironmentDetailLayout,
  EnvironmentIntegrationsPage,
  EnvironmentResourcesPage,
  EnvironmentSecurityPage,
  EnvironmentSettingsPage,
  EnvironmentsPage,
  ErrorPage,
  ForgotPassPage,
  ForgotPassVerifyPage,
  LoginPage,
  LogoutPage,
  NotFoundPage,
  OtpRecoveryCodesPage,
  OtpSetupPage,
  PlansPage,
  ReactRouterErrorElement,
  SSHSettingsPage,
  SecuritySettingsPage,
  SettingsPage,
  SettingsPageLayout,
  SignupPage,
  TeamPage,
  UnauthRequired,
  VerifyEmailPage,
} from "@app/ui";

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

export const ftuxRoutes: RouteObject[] = [
  {
    path: routes.HOME_PATH,
    element: <AuthRequired />,
    children: [
      {
        index: true,
        element: (
          <CreateProjectLayout>
            <DeploymentsPage />
          </CreateProjectLayout>
        ),
      },
      {
        path: routes.LOGOUT_PATH,
        element: <LogoutPage />,
      },
      {
        path: routes.ELEVATE_PATH,
        element: <ElevatePage />,
      },

      // create project routes
      {
        path: routes.CREATE_PROJECT_ADD_KEY_PATH,
        element: (
          <ElevateRequired>
            <CreateProjectLayout />
          </ElevateRequired>
        ),
        children: [
          {
            index: true,
            element: <CreateProjectAddKeyPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_ADD_NAME_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectNamePage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_GIT_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectGitPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_SETUP_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectFromAccountSetupPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_GIT_APP_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            path: routes.CREATE_PROJECT_GIT_PUSH_PATH,
            element: <CreateProjectGitPushPage />,
          },
          {
            path: routes.CREATE_PROJECT_GIT_SETTINGS_PATH,
            element: <CreateProjectGitSettingsPage />,
          },
          {
            path: routes.CREATE_PROJECT_GIT_STATUS_PATH,
            element: <CreateProjectGitStatusPage />,
          },
          {
            path: routes.CREATE_PROJECT_APP_SETUP_PATH,
            element: <CreateProjectFromAppSetupPage />,
          },
        ],
      },
    ],
  },

  {
    path: routes.CREATE_PROJECT_PATH,
    element: <CreateProjectPage />,
  },

  {
    path: routes.LOGIN_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  {
    path: routes.FORGOT_PASS_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <ForgotPassPage />,
      },
    ],
  },

  {
    path: routes.RESET_PASSWORD_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <ForgotPassVerifyPage />,
      },
    ],
  },

  {
    path: routes.VERIFY_EMAIL_REQUEST_PATH,
    element: <VerifyEmailPage />,
  },

  {
    path: routes.VERIFY_EMAIL_PATH,
    element: <VerifyEmailPage />,
  },

  {
    path: routes.SIGNUP_PATH,
    element: <SignupPage />,
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
    path: "*",
    element: <NotFoundPage />,
  },
].map(applyPatches);

export const appRoutes: RouteObject[] = [
  {
    path: routes.HOME_PATH,
    element: <AuthRequired />,
    children: [
      {
        index: true,
        element: <AppsPage />,
      },

      {
        path: routes.APPS_PATH,
        children: [
          {
            index: true,
            element: <AppsPage />,
          },

          {
            element: <AppDetailLayout />,
            children: [
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
                path: routes.APP_SETTINGS_PATH,
                element: <AppSettingsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.DATABASES_PATH,
        children: [
          {
            index: true,
            element: <DatabasesPage />,
          },

          {
            element: <DatabaseDetailLayout />,
            children: [
              {
                path: routes.DATABASE_ENDPOINTS_PATH,
                element: <DatabaseEndpointsPage />,
              },
              {
                path: routes.DATABASE_ACTIVITY_PATH,
                element: <DatabaseActivityPage />,
              },
              {
                path: routes.DATABASE_CLUSTER_PATH,
                element: <DatabaseClusterPage />,
              },
              {
                path: routes.DATABASE_BACKUPS_PATH,
                element: <DatabaseBackupsPage />,
              },
              {
                path: routes.DATABASE_SCALE_PATH,
                element: <DatabaseScalePage />,
              },
              {
                path: routes.DATABASE_SETTINGS_PATH,
                element: <DatabaseSettingsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.ENVIRONMENTS_PATH,
        children: [
          {
            index: true,
            element: <EnvironmentsPage />,
          },

          {
            element: <EnvironmentDetailLayout />,
            children: [
              {
                path: routes.ENVIRONMENT_RESOURCES_PATH,
                element: <EnvironmentResourcesPage />,
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
                path: routes.ENVIRONMENT_CERTIFICATES_PATH,
                element: <EnvironmentCertificatesPage />,
              },
              {
                path: routes.ENVIRONMENT_ACTIVITY_PATH,
                element: <EnvironmentActivityPage />,
              },
              {
                path: routes.ENVIRONMENT_BACKUPS_PATH,
                element: <EnvironmentBackupsPage />,
              },
              {
                path: routes.ENVIRONMENT_SETTINGS_PATH,
                element: <EnvironmentSettingsPage />,
              },
            ],
          },
        ],
      },

      {
        path: routes.LOGOUT_PATH,
        element: <LogoutPage />,
      },

      {
        path: routes.VERIFY_EMAIL_REQUEST_PATH,
        element: <VerifyEmailPage />,
      },

      {
        path: routes.VERIFY_EMAIL_PATH,
        element: <VerifyEmailPage />,
      },

      {
        path: routes.PLANS_PATH,
        element: <PlansPage />,
      },

      {
        path: routes.BILLING_METHOD_PAGE,
        element: <BillingMethodPage />,
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
        path: routes.SETTINGS_PATH,
        element: <SettingsPageLayout />,
        children: [
          {
            index: true,
            element: <SettingsPage />,
          },
          {
            path: routes.TEAM_PATH,
            element: <TeamPage />,
          },
        ],
      },

      {
        path: routes.CREATE_PROJECT_ADD_KEY_PATH,
        element: (
          <ElevateRequired>
            <CreateProjectLayout />
          </ElevateRequired>
        ),
        children: [
          {
            index: true,
            element: <CreateProjectAddKeyPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_ADD_NAME_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectNamePage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_GIT_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectGitPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_GIT_APP_PATH,
        element: <CreateProjectLayout />,
        children: [
          {
            path: routes.CREATE_PROJECT_GIT_PUSH_PATH,
            element: <CreateProjectGitPushPage />,
          },
          {
            path: routes.CREATE_PROJECT_GIT_SETTINGS_PATH,
            element: <CreateProjectGitSettingsPage />,
          },
          {
            path: routes.CREATE_PROJECT_GIT_STATUS_PATH,
            element: <CreateProjectGitStatusPage />,
          },
        ],
      },
    ],
  },

  {
    path: routes.CREATE_PROJECT_PATH,
    element: <CreateProjectPage />,
  },

  {
    element: <ElevateRequired />,
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
    path: routes.LOGIN_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  {
    path: routes.FORGOT_PASS_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <ForgotPassPage />,
      },
    ],
  },

  {
    path: routes.FORGOT_PASS_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <ForgotPassVerifyPage />,
      },
    ],
  },

  {
    path: routes.SIGNUP_PATH,
    element: <UnauthRequired />,
    children: [
      {
        index: true,
        element: <SignupPage />,
      },
    ],
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
    path: "*",
    element: <NotFoundPage />,
  },
].map(applyPatches);

export const ftuxRouter = createBrowserRouter(ftuxRoutes);
export const router = createBrowserRouter(appRoutes);
