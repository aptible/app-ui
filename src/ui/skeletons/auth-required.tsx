import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLoader } from 'saga-query/react';

import { loginUrl } from '@app/routes';
import { selectIsUserAuthenticated } from '@app/token';
import { fetchCurrentToken } from '@app/auth';

import { Nav } from '../nav';
import { Loading } from '../loading';

export const AuthRequired = () => {
  const loader = useLoader(fetchCurrentToken);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);

  if (!loader.isLoading && !isAuthenticated) {
    return <Navigate to={loginUrl()} />;
  }

  if (loader.isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <Nav>
      <Outlet />
    </Nav>
  );
};
