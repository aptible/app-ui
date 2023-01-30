import { createBrowserRouter, RouteObject } from "react-router-dom";

import {
  NotFoundPage,
  LoginPage,
  SignupPage,
  AuthRequired,
  ElevateRequired,
  VerifyEmailPage,
  CreateOrgPage,
  ElevatePage,
  SecuritySettingsPage,
  SSHSettingsPage,
  OtpSetupPage,
  OtpRecoveryCodesPage,
  AddSecurityKeyPage,
  LogoutPage,
  TeamPage,
  SettingsPage,
  AppsPage,
  AppDetailPage,
  AppSettingsPage,
  AppSecurityPage,
  AppActivityPage,
  AppDetailLayout,
  DatabasesPage,
  DatabaseDetailLayout,
  DatabaseDetailPage,
  DatabaseActivityPage,
  DatabaseSecurityPage,
  DatabaseBackupsPage,
  DatabaseSettingsPage,
  CreateProjectPage,
  CreateProjectGitPage,
  CreateProjectGitLayout,
  CreateProjectAddKeyPage,
  CreateProjectGitPushPage,
  CreateProjectGitSettingsPage,
  CreateProjectGitStatusPage,
} from "@app/ui";
import * as routes from "@app/routes";

const appRoutes: RouteObject[] = [
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
            path: routes.APP_DETAIL_PATH,
            element: <AppDetailLayout />,
            children: [
              {
                index: true,
                element: <AppDetailPage />,
              },
              {
                path: routes.APP_ACTIVITY_PATH,
                element: <AppActivityPage />,
              },
              {
                path: routes.APP_SECURITY_PATH,
                element: <AppSecurityPage />,
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
            path: routes.DATABASE_DETAIL_PATH,
            element: <DatabaseDetailLayout />,
            children: [
              {
                index: true,
                element: <DatabaseDetailPage />,
              },
              {
                path: routes.DATABASE_ACTIVITY_PATH,
                element: <DatabaseActivityPage />,
              },
              {
                path: routes.DATABASE_SECURITY_PATH,
                element: <DatabaseSecurityPage />,
              },
              {
                path: routes.DATABASE_BACKUPS_PATH,
                element: <DatabaseBackupsPage />,
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
        path: routes.CREATE_ORG_PATH,
        element: <CreateOrgPage />,
      },

      {
        path: routes.ELEVATE_PATH,
        element: <ElevatePage />,
      },

      {
        path: routes.SETTINGS_PATH,
        element: <SettingsPage />,
      },

      {
        path: routes.TEAM_PATH,
        element: <TeamPage />,
      },

      {
        path: routes.CREATE_PROJECT_PATH,
        element: <CreateProjectPage />,
      },
      {
        path: routes.CREATE_PROJECT_ADD_KEY_PATH,
        element: <CreateProjectGitLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectAddKeyPage />,
          },
        ],
      },
      {
        path: routes.CREATE_PROJECT_GIT_PATH,
        element: <CreateProjectGitLayout />,
        children: [
          {
            index: true,
            element: <CreateProjectGitPage />,
          },
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
    element: <LoginPage />,
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
    path: "*",
    element: <NotFoundPage />,
  },
];

export const router = createBrowserRouter(appRoutes);
