import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { Box, Link } from '@aptible/arrow-ds';

import { homeUrl } from '@app/routes';
import { selectIsUserAuthenticated } from '@app/token';

export const PublicOnly = () => {
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  console.log(isAuthenticated);
  if (isAuthenticated) {
    return (
      <Box>
        You are already signed in. Please go to{' '}
        <Link to={homeUrl()}>dashboard</Link>
      </Box>
    );
  }

  return <Outlet />;
};
