import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

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
    <Routes>
      <Route path={LOGIN_PATH}>
        <LoginPage />
      </Route>

      <Route path={SIGNUP_PATH}>
        <SignupPage />
      </Route>

      <Route path={HOME_PATH} element={<AuthRequired />}>
        <HomePage />
      </Route>

      <Route path={VERIFY_EMAIL_REQUEST_PATH} element={<AuthRequired />}>
        <VerifyEmailPage />
      </Route>

      <Route path={VERIFY_EMAIL_PATH} element={<AuthRequired />}>
        <VerifyEmailPage />
      </Route>

      <Route path={CREATE_ORG_PATH} element={<AuthRequired />}>
        <CreateOrgPage />
      </Route>

      <Route path={ELEVATE_PATH} element={<AuthRequired />}>
        <ElevatePage />
      </Route>

      <Route path={SECURITY_SETTINGS_PATH} element={<ElevateRequired />}>
        <SecuritySettingsPage />
      </Route>

      <Route path={SSH_SETTINGS_PATH} element={<ElevateRequired />}>
        <SSHSettingsPage />
      </Route>

      <Route path={OTP_SETUP_PATH} element={<ElevateRequired />}>
        <OtpSetupPage />
      </Route>

      <Route path={OTP_RECOVERY_CODES_PATH} element={<ElevateRequired />}>
        <OtpRecoveryCodesPage />
      </Route>

      <Route path={ADD_SECURITY_KEY_PATH} element={<ElevateRequired />}>
        <AddSecurityKeyPage />
      </Route>

      <Route path={NOT_FOUND_PATH}>
        <NotFoundPage />
      </Route>

      <Route path="*">
        <NotFoundPage />
      </Route>
    </Routes>
  </div>
);
