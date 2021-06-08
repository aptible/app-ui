import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import {
  HomePage,
  NotFoundPage,
  LoginPage,
  SignupPage,
  AuthRequired,
  VerifyEmailPage,
  CreateOrgPage,
} from '@app/ui';
import {
  HOME_PATH,
  NOT_FOUND_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  VERIFY_EMAIL_REQUEST_PATH,
  VERIFY_EMAIL_PATH,
  CREATE_ORG_PATH,
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

      <Route path={NOT_FOUND_PATH}>
        <NotFoundPage />
      </Route>

      <Route path="*">
        <NotFoundPage />
      </Route>
    </Routes>
  </div>
);
