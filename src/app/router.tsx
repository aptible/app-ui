import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { HomePage, NotFoundPage, LoginPage, SignupPage } from '@app/ui';
import {
  HOME_PATH,
  NOT_FOUND_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
} from '@app/routes';

export const Router = () => (
  <Routes>
    <Helmet titleTemplate="%s - Aptible Deploy" defaultTitle="Aptible Deploy" />
    <Route path={HOME_PATH}>
      <HomePage />
    </Route>

    <Route path={LOGIN_PATH}>
      <LoginPage />
    </Route>

    <Route path={SIGNUP_PATH}>
      <SignupPage />
    </Route>

    <Route path={NOT_FOUND_PATH} element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
