import { Routes, Route, Navigate, useParams } from "react-router-dom";

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
  ModalPortal,
} from "@app/ui";
import * as routes from "@app/routes";

const DatabaseRedirect = () => {
  const { id = "" } = useParams();
  return <Navigate replace={true} to={routes.databaseOverviewUrl(id)} />;
};

const AppRedirect = () => {
  const { id = "" } = useParams();
  return <Navigate replace={true} to={routes.appOverviewUrl(id)} />;
};

export const Router = () => (
  <div className="h-full w-full">
    <ModalPortal />
    <Routes>
      <Route path={routes.HOME_PATH} element={<AuthRequired />}>
        <Route
          index={true}
          element={<Navigate to={routes.appsUrl()} replace={true} />}
        />
      </Route>

      <Route path={routes.APPS_PATH} element={<AuthRequired />}>
        <Route index={true} element={<AppsPage />} />
      </Route>

      <Route path={routes.APP_DETAIL_PATH} element={<AuthRequired />}>
        <Route element={<AppDetailLayout />}>
          <Route index={true} element={<AppRedirect />} />
          <Route path={routes.APP_OVERVIEW_PATH} element={<AppDetailPage />} />
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
        <Route index={true} element={<DatabasesPage />} />
      </Route>

      <Route path={routes.DATABASE_DETAIL_PATH} element={<AuthRequired />}>
        <Route element={<DatabaseDetailLayout />}>
          <Route index={true} element={<DatabaseRedirect />} />
          <Route
            path={routes.DATABASE_OVERVIEW_PATH}
            element={<DatabaseDetailPage />}
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
        <Route index={true} element={<LogoutPage />} />
      </Route>

      <Route path={routes.LOGIN_PATH} element={<LoginPage />} />

      <Route path={routes.SIGNUP_PATH} element={<SignupPage />} />

      <Route path={routes.VERIFY_EMAIL_REQUEST_PATH} element={<AuthRequired />}>
        <Route index={true} element={<VerifyEmailPage />} />
      </Route>

      <Route path={routes.VERIFY_EMAIL_PATH} element={<AuthRequired />}>
        <Route index={true} element={<VerifyEmailPage />} />
      </Route>

      <Route path={routes.CREATE_ORG_PATH} element={<AuthRequired />}>
        <Route index={true} element={<CreateOrgPage />} />
      </Route>

      <Route path={routes.ELEVATE_PATH} element={<AuthRequired />}>
        <Route index={true} element={<ElevatePage />} />
      </Route>

      <Route path={routes.SECURITY_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index={true} element={<SecuritySettingsPage />} />
      </Route>

      <Route path={routes.SSH_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index={true} element={<SSHSettingsPage />} />
      </Route>

      <Route path={routes.OTP_SETUP_PATH} element={<ElevateRequired />}>
        <Route index={true} element={<OtpSetupPage />} />
      </Route>

      <Route
        path={routes.OTP_RECOVERY_CODES_PATH}
        element={<ElevateRequired />}
      >
        <Route index={true} element={<OtpRecoveryCodesPage />} />
      </Route>

      <Route path={routes.ADD_SECURITY_KEY_PATH} element={<ElevateRequired />}>
        <Route index={true} element={<AddSecurityKeyPage />} />
      </Route>

      <Route path={routes.NOT_FOUND_PATH}>
        <Route index={true} element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </div>
);
