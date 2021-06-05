import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Flex, Loading } from '@aptible/arrow-ds';

import { selectLoaderById } from '@app/loaders';
import { loginUrl } from '@app/routes';
import { selectIsUserAuthenticated, fetchCurrentToken } from '@app/token';
import { AppState } from '@app/types';

import { LogoutButton } from '../auth/logout-button';

export const AuthRequired = () => {
  const loader = useSelector((state: AppState) =>
    selectLoaderById(state, { id: `${fetchCurrentToken}` }),
  );
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

  if (loader.lastRun > 0 && !loader.loading && !isAuthenticated) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.loading) {
    return (
      <Flex className="w-full h-full items-center justify-center">
        <Loading />
      </Flex>
    );
  }

  return (
    <Box>
      <Outlet />
      <LogoutButton />
    </Box>
  );
};
