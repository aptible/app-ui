import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ToastContainer } from 'react-toastify';

import {
  HomePage,
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
} from '@app/ui';
import {
  HOME_PATH,
  NOT_FOUND_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  VERIFY_EMAIL_REQUEST_PATH,
  VERIFY_EMAIL_PATH,
  CREATE_ORG_PATH,
  ELEVATE_PATH,
  SECURITY_SETTINGS_PATH,
  SSH_SETTINGS_PATH,
  OTP_SETUP_PATH,
  OTP_RECOVERY_CODES_PATH,
  ADD_SECURITY_KEY_PATH,
} from '@app/routes';

export const Router = () => (
  <div>
    <Helmet titleTemplate="%s - Aptible Deploy" defaultTitle="Aptible Deploy" />
    <ToastContainer />
    <Routes>
      <Route path={LOGIN_PATH} element={<LoginPage />} />

      <Route path={SIGNUP_PATH} element={<SignupPage />} />

      <Route path={HOME_PATH} element={<AuthRequired />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path={VERIFY_EMAIL_REQUEST_PATH} element={<AuthRequired />}>
        <Route index element={<VerifyEmailPage />} />
      </Route>

      <Route path={VERIFY_EMAIL_PATH} element={<AuthRequired />}>
        <Route index element={<VerifyEmailPage />} />
      </Route>

      <Route path={CREATE_ORG_PATH} element={<AuthRequired />}>
        <Route index element={<CreateOrgPage />} />
      </Route>

      <Route path={ELEVATE_PATH} element={<AuthRequired />}>
        <Route index element={<ElevatePage />} />
      </Route>

      <Route path={SECURITY_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index element={<SecuritySettingsPage />} />
      </Route>

      <Route path={SSH_SETTINGS_PATH} element={<ElevateRequired />}>
        <Route index element={<SSHSettingsPage />} />
      </Route>

      <Route path={OTP_SETUP_PATH} element={<ElevateRequired />}>
        <Route index element={<OtpSetupPage />} />
      </Route>

      <Route path={OTP_RECOVERY_CODES_PATH} element={<ElevateRequired />}>
        <Route index element={<OtpRecoveryCodesPage />} />
      </Route>

      <Route path={ADD_SECURITY_KEY_PATH} element={<ElevateRequired />}>
        <Route index element={<AddSecurityKeyPage />} />
      </Route>

      <Route path={NOT_FOUND_PATH}>
        <Route index element={<NotFoundPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </div>
);
