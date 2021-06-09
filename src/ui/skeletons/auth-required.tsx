import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Flex, Loading } from '@aptible/arrow-ds';

import { selectLoader } from '@app/loaders';
import { loginUrl } from '@app/routes';
import { selectIsUserAuthenticated } from '@app/token';
import { fetchCurrentToken } from '@app/auth';

import { LogoutButton } from '../auth/logout-button';
import { Nav } from '../nav';

export const AuthRequired = () => {
  const loader = useSelector(selectLoader(`${fetchCurrentToken}`));
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

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

  return (
    <Nav>
      <Outlet />
      <LogoutButton />
    </Nav>
  );
};
