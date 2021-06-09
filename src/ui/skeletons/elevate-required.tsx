import React from 'react';
import { useLocation } from 'react-router';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Flex, Loading } from '@aptible/arrow-ds';

import { selectLoader } from '@app/loaders';
import { loginUrl, elevateUrl } from '@app/routes';
import {
  selectIsUserAuthenticated,
  selectIsElevatedTokenValid,
} from '@app/token';
import { fetchCurrentToken } from '@app/auth';

import { LogoutButton } from '../auth/logout-button';
import { Nav } from '../nav';

export const ElevateRequired = () => {
  const loader = useSelector(selectLoader(`${fetchCurrentToken}`));
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const isElevatedTokenValid = useSelector(selectIsElevatedTokenValid);
  const location = useLocation();

  if (loader.lastRun > 0 && !loader.isLoading && !isAuthenticated) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.isLoading) {
    return (
      <Flex className="w-full h-full items-center justify-center">
        <Loading />
      </Flex>
    );
  }

  if (!isElevatedTokenValid) {
    return <Navigate to={elevateUrl(location.pathname)} />;
  }

  return (
    <Nav>
      <Outlet />
      <LogoutButton />
    </Nav>
  );
};
