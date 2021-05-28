import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { HomePage, NotFoundPage } from '@app/ui';
import { HOME_URL, NOT_FOUND_URL } from '@app/routes';

export const Router = () => (
  <Routes>
    <Route path={HOME_URL}>
      <HomePage />
    </Route>

    <Route path={NOT_FOUND_URL} element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);
