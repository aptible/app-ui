import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

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
  AppsPage,
  AppOverviewPage,
  DatabasesPage,
  LogoutPage,
  TeamPage,
  SettingsPage,
  AppSettingsPage,
  AppSecurityPage,
  AppActivityPage,
  AppDetailLayout,
  DatabaseDetailLayout,
  DatabaseOverviewPage,
} from '@app/ui';
import * as routes from '@app/routes';
import { DatabaseActivityPage } from '@app/ui/pages/databases/database-activity-page';
import { DatabaseSecurityPage } from '@app/ui/pages/databases/database-security-page';
import { DatabaseBackupsPage } from '@app/ui/pages/databases/database-backups-page';
import { DatabaseSettingsPage } from '@app/ui/pages/databases/database-settings-page';

const DatabaseRedirect = () => {
  const { id = '' } = useParams();
  return <Navigate replace to={routes.databaseOverviewUrl(id)} />;
};

const AppRedirect = () => {
  const { id = '' } = useParams();
  return <Navigate replace to={routes.appOverviewUrl(id)} />;
};

export const Router = () => (
  <div className="h-full w-full">
    <Routes>
      <Route path={routes.HOME_PATH} element={<AuthRequired />}>
        <Route index element={<Navigate to={routes.appsUrl()} replace />} />
      </Route>

      <Route path={routes.APPS_PATH} element={<AuthRequired />}>
        <Route index element={<AppsPage />} />
      </Route>

      <Route path={routes.APP_DETAIL_PATH} element={<AuthRequired />}>
        <Route element={<AppDetailLayout />}>
          <Route index element={<AppRedirect />} />
          <Route
            path={routes.APP_OVERVIEW_PATH}
            element={<AppOverviewPage />}
          />
          <Route
            path={routes.APP_ACTIVITY_PATH}
            element={<AppActivityPage />}
          />
          <Route
            path={routes.APP_SECURITY_PATH}
            element={<AppSecurityPage />}
          />
          <Route
            path={routes.APP_SETTINGS_PATH}
            element={<AppSettingsPage />}
          />
        </Route>
      </Route>

      <Route path={routes.DATABASES_PATH} element={<AuthRequired />}>
        <Route index element={<DatabasesPage />} />
      </Route>

      <Route path={routes.DATABASE_DETAIL_PATH} element={<AuthRequired />}>
        <Route element={<DatabaseDetailLayout />}>
          <Route index element={<DatabaseRedirect />} />
          <Route
            path={routes.DATABASE_OVERVIEW_PATH}
            element={<DatabaseOverviewPage />}
          />
          <Route
            path={routes.DATABASE_ACTIVITY_PATH}
            element={<DatabaseActivityPage />}
          />
          <Route
            path={routes.DATABASE_SECURITY_PATH}
            element={<DatabaseSecurityPage />}
          />
          <Route
            path={routes.DATABASE_BACKUPS_PATH}
            element={<DatabaseBackupsPage />}
          />
          <Route
            path={routes.DATABASE_SETTINGS_PATH}
            element={<DatabaseSettingsPage />}
          />
        </Route>
      </Route>

      <Route path={routes.SETTINGS_PATH} element={<AuthRequired />}>
        <Route element={<SettingsPage />}>
          <Route path={routes.TEAM_PATH} element={<TeamPage />} />
        </Route>
      </Route>

      <Route path={routes.LOGOUT_PATH} element={<AuthRequired />}>
        <Route index element={<LogoutPage />} />
      </Route>

      <Route path={routes.LOGIN_PATH} element={<LoginPage />} />

      <Route path={routes.SIGNUP_PATH} element={<SignupPage />} />

      <Route path={routes.VERIFY_EMAIL_REQUEST_PATH} element={<AuthRequired />}>
        <Route index element={<VerifyEmailPage />} />
      </Route>

      <Route path={routes.VERIFY_EMAIL_PATH} element={<AuthRequired />}>
        <Route index element={<VerifyEmailPage />} />
      </Route>

      <Route path={routes.CREATE_ORG_PATH} element={<AuthRequired />}>
        <Route index element={<CreateOrgPage />} />
      </Route>

      <Route path={routes.ELEVATE_PATH} element={<AuthRequired />}>
        <Route index element={<ElevatePage />} />
      </Route>

      <Route path={routes.SECURITY_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index element={<SecuritySettingsPage />} />
      </Route>

      <Route path={routes.SSH_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index element={<SSHSettingsPage />} />
      </Route>

      <Route path={routes.OTP_SETUP_PATH} element={<ElevateRequired />}>
        <Route index element={<OtpSetupPage />} />
      </Route>

      <Route
        path={routes.OTP_RECOVERY_CODES_PATH}
        element={<ElevateRequired />}
      >
        <Route index element={<OtpRecoveryCodesPage />} />
      </Route>

      <Route path={routes.ADD_SECURITY_KEY_PATH} element={<ElevateRequired />}>
        <Route index element={<AddSecurityKeyPage />} />
      </Route>

      <Route path={routes.NOT_FOUND_PATH}>
        <Route index element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    <ToastContainer />
  </div>
);
