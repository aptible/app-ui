import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { HomePage, NotFoundPage } from '@app/ui';
import { HOME_URL, NOT_FOUND_URL } from '@app/routes';

export const Router = () => (
  <Routes>
    <Helmet titleTemplate="%s - Aptible Deploy" defaultTitle="Aptible Deploy" />
    <Route path={HOME_URL}>
      <HomePage />
    </Route>

    <Route path={NOT_FOUND_URL} element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
